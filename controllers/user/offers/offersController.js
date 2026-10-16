import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import { Offer } from '../../../models/Offer.js';
import { CreditCardOffer } from '../../../models/CreditCardOffer.js';
import { PanVerification } from '../../../models/PanVerification.js';
import crypto from 'crypto';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { sendOtpSms } from '../../../services/sms/smsService.js';

// 9.1 GET /api/offers/index
export const getOffers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
        filter.is_active = true;
        const offers = await Offer.find(filter);
        return sendSuccess(res, 200, 'Offers retrieved successfully.', {
            total_offers: offers.length,
            offers: offers.map(o => ({
                id: o._id,
                title: o.title,
                category: o.category,
                bank_name: o.bank_name,
                bank_logo_url: o.bank_logo_url,
                badge_text: o.badge_text,
                interest_rate_formatted: o.interest_rate_formatted,
                max_amount_formatted: o.max_amount_formatted,
                tenure_formatted: o.tenure_formatted,
                is_pre_approved: o.is_pre_approved
            }))
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 9.2 GET /api/offers/detail
export const getOfferDetail = async (req, res) => {
    try {
        const offerId = req.query.id;
        if (!offerId || !mongoose.isValidObjectId(offerId)) return sendError(res, 404, 'Offer not found.');
        const offer = await Offer.findById(offerId);
        if (!offer) return sendError(res, 404, 'Offer not found.');
        return sendSuccess(res, 200, 'Offer details retrieved.', {
            id: offer._id,
            title: offer.title,
            bank_name: offer.bank_name,
            interest_rate_formatted: offer.interest_rate_formatted,
            processing_fee: offer.processing_fee,
            key_features: offer.key_features || [],
            eligibility_criteria: offer.eligibility_criteria || [],
            required_documents: offer.required_documents || []
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 9.3 GET /api/credit-cards/offers
export const getCardOffers = async (req, res) => {
    try {
        const cards = await CreditCardOffer.find({ is_active: true });
        return sendSuccess(res, 200, 'Credit card offers retrieved successfully.', {
            total_cards: cards.length,
            cards: cards.map(c => ({
                id: c._id,
                card_name: c.card_name,
                bank_name: c.bank_name,
                card_type: c.card_type,
                annual_fee: c.annual_fee,
                joining_fee: c.joining_fee,
                cashback_rate: c.cashback_rate,
                credit_limit_estimate: c.credit_limit_estimate,
                key_benefits: c.key_benefits || []
            }))
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 9.4 POST /api/credit-cards/verify-pan
export const verifyPan = async (req, res) => {
    try {
        const { pan, dob, full_name } = req.body;
        if (!pan || !dob) return sendError(res, 422, 'pan and dob are required.');

        const panUpper = String(pan).trim().toUpperCase();
        const pan_verification_id = `PV-${panUpper}`;

        const rawPhone = req.user.phone || req.user.number || req.body.phone;
        if (!rawPhone) {
            return sendError(res, 422, 'User mobile number not found in profile to send OTP.');
        }

        const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
            return sendError(res, 422, 'Invalid mobile number on user profile.');
        }

        const masked_phone = cleanPhone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Save or update PAN verification record (valid for 10 minutes)
        await PanVerification.findOneAndUpdate(
            { pan_verification_id },
            {
                pan_verification_id,
                user_id: req.user._id,
                pan: panUpper,
                dob: String(dob).trim(),
                full_name: full_name || req.user.full_name || req.user.name || '',
                phone: cleanPhone,
                otp,
                is_verified: false,
                verification_token: null,
                expires_at: new Date(Date.now() + 10 * 60 * 1000)
            },
            { upsert: true, new: true }
        );

        // Send OTP via SMS (PRP SMS — 2FA_Verification_OTP template)
        let smsSent = true;
        try {
            const smsRes = await sendOtpSms(cleanPhone, otp, 'twoFa');
            if (!smsRes.success) {
                console.error(`[PRP SMS] PAN OTP delivery warning for ${cleanPhone}:`, smsRes.message);
            } else {
                console.log(`[PRP SMS] PAN OTP successfully sent to ${cleanPhone}`);
            }
        } catch (smsErr) {
            console.error('[PRP SMS] Error sending PAN OTP:', smsErr.message);
            smsSent = false;
        }

        // Log OTP in console for dev/testing visibility
        console.log(`[DEV] PAN Verification OTP for ${cleanPhone} (${pan_verification_id}): ${otp}`);

        return sendSuccess(res, 200, 'OTP sent for PAN verification.', {
            pan_verification_id,
            pan: panUpper,
            full_name: full_name || req.user.full_name || req.user.name,
            masked_phone,
            expires_in_seconds: 600,
            sms_sent: smsSent,
            message: `A 4-digit verification code was sent to ${masked_phone}.`
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 9.5 POST /api/credit-cards/verify-pan-otp
export const verifyPanOtp = async (req, res) => {
    try {
        const { pan_verification_id, otp } = req.body;
        if (!pan_verification_id || !otp) return sendError(res, 422, 'pan_verification_id and otp are required.');

        const id = String(pan_verification_id).trim();
        const inputOtp = String(otp).trim();

        const record = await PanVerification.findOne({ pan_verification_id: id });
        if (!record) {
            return sendError(res, 404, 'PAN verification record not found or expired.');
        }

        if (record.expires_at && new Date() > new Date(record.expires_at)) {
            return sendError(res, 400, 'OTP expired. Please request a new verification code.');
        }

        if (record.otp !== inputOtp) {
            return sendError(res, 400, 'Invalid OTP. Please check and try again.');
        }

        const verification_token = 'PVT_' + crypto.randomBytes(16).toString('hex');
        record.is_verified = true;
        record.verification_token = verification_token;
        await record.save();

        // Also save verified PAN to user profile if not already present
        if (!req.user.pan) {
            req.user.pan = record.pan;
            req.user.pan_number = record.pan;
            await req.user.save();
        }

        return sendSuccess(res, 200, 'PAN verification successful.', {
            pan_verification_id: record.pan_verification_id,
            verification_token,
            is_verified: true,
            pan: record.pan,
            full_name: record.full_name || req.user.full_name || req.user.name
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 9.6 POST /api/credit-cards/apply
export const applyCard = async (req, res) => {
    try {
        const { card_id, pan, employment_type, company_name, annual_income } = req.body;
        if (!card_id || !pan || !employment_type || !company_name || !annual_income) {
            return sendError(res, 422, 'card_id, pan, employment_type, company_name, and annual_income are required.');
        }
        const application_id = 'CC-' + Math.floor(10000 + Math.random() * 90000);

        const userEmail = req.user?.email || req.body.email;
        if (userEmail) {
            sendTemplateMail(userEmail, 'application_submitted', { application_token: application_id })
                .catch(err => console.error('Credit card apply email error:', err));
        }

        return res.status(201).json({
            success: true,
            message: 'Credit card application submitted successfully.',
            data: {
                application_id,
                card_id,
                status: 'APPLICATION_SUBMITTED',
                applied_date: new Date().toISOString().split('T')[0]
            }
        });
    } catch (e) { return sendError(res, 500, e.message); }
};
