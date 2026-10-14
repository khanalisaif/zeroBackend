// Module 5: CIBIL Score & AI Credit Advisor Controller
// Docs: Module 5.1 - 5.5

import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import { CibilScore } from '../../../models/CibilScore.js';
import { Consultation } from '../../../models/Consultation.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

// Default dummy CIBIL profile to return if not yet configured by admin in database
const DEFAULT_CIBIL_DUMMY = {
    score: 786,
    rating: 'Good',
    rating_description: 'Your credit profile qualifies for premium pre-approved loans.',
    change_delta: '+14',
    min_score: 300,
    max_score: 900,
    last_updated: '2026-10-09 18:00:00'
};

// 5.1 GET /api/cibil/score
export const getScore = async (req, res) => {
    try {
        const cibil = await CibilScore.findOne({ user_id: req.user._id });

        // If admin has set or user has refreshed a real score in DB, use it:
        if (cibil && cibil.score) {
            const score = cibil.score;
            const rating = cibil.rating || (score >= 750 ? 'Good' : score >= 700 ? 'Fair' : 'Poor');
            const rating_description = cibil.rating_description || 'Your credit profile qualifies for premium pre-approved loans.';
            const change_delta = cibil.change_delta || '+0';
            const last_updated = cibil.last_updated
                ? new Date(cibil.last_updated).toISOString().replace('T', ' ').substring(0, 19)
                : (cibil.updated_at ? new Date(cibil.updated_at).toISOString().replace('T', ' ').substring(0, 19) : DEFAULT_CIBIL_DUMMY.last_updated);

            return sendSuccess(res, 200, 'CIBIL score retrieved.', {
                score,
                rating,
                rating_description,
                change_delta,
                min_score: 300,
                max_score: 900,
                last_updated
            });
        }

        // Otherwise fallback to realistic dummy data as requested by user
        return sendSuccess(res, 200, 'CIBIL score retrieved.', DEFAULT_CIBIL_DUMMY);
    } catch (e) {
        return sendError(res, 500, e.message);
    }
};

// 5.2 POST /api/cibil/refresh
export const refreshScore = async (req, res) => {
    try {
        let cibil = await CibilScore.findOne({ user_id: req.user._id });
        const currentScore = cibil ? cibil.score : DEFAULT_CIBIL_DUMMY.score;
        const delta = 6;
        const newScore = Math.min(900, currentScore + delta);
        const rating = newScore >= 750 ? 'Excellent' : 'Good';
        const now = new Date();

        if (cibil) {
            cibil.score = newScore;
            cibil.rating = rating;
            cibil.change_delta = `+${delta}`;
            cibil.last_updated = now;
            await cibil.save();
        } else {
            cibil = new CibilScore({
                user_id: req.user._id,
                score: newScore,
                rating,
                rating_description: 'Your credit profile qualifies for premium pre-approved loans.',
                change_delta: `+${delta}`,
                last_updated: now
            });
            await cibil.save();
        }

        return sendSuccess(res, 200, 'CIBIL score refreshed successfully.', {
            score: newScore,
            change_delta: `+${delta}`,
            rating,
            refreshed_at: now.toISOString().replace('T', ' ').substring(0, 19)
        });
    } catch (e) {
        return sendError(res, 500, e.message);
    }
};

// 5.3 GET /api/cibil/factors
export const getFactors = async (req, res) => {
    return sendSuccess(res, 200, 'Credit factors analysis retrieved.', {
        factors: [
            {
                name: 'Payment History',
                impact: 'High (35%)',
                score_value: '100%',
                status: 'Excellent',
                description: '48 of 48 payments made on time.'
            },
            {
                name: 'Credit Utilization',
                impact: 'High (30%)',
                score_value: '32%',
                status: 'Average',
                description: 'Recommended to keep below 30%.'
            },
            {
                name: 'Credit Age',
                impact: 'Medium (15%)',
                score_value: '6 Yrs 4 Mos',
                status: 'Good',
                description: 'Oldest active credit line opened in 2020.'
            },
            {
                name: 'Total Accounts',
                impact: 'Low (10%)',
                score_value: '5 Accounts',
                status: 'Good',
                description: 'Healthy mix of secured and unsecured loans.'
            },
            {
                name: 'Hard Inquiries',
                impact: 'Low (10%)',
                score_value: '2 Inquiries',
                status: 'Low Risk',
                description: '2 lender inquiries in the last 12 months.'
            }
        ]
    });
};

// 5.4 POST /api/cibil/ai-chat
export const aiChat = async (req, res) => {
    try {
        const message = (req.body.message || '').toLowerCase();
        let reply = 'Your current credit health is strong. To boost your score above 800, keep your credit utilization under 30% and ensure zero late repayments.';
        let chips = [
            'How to request a limit increase?',
            'When is my credit card due date?',
            'Schedule credit consultation'
        ];

        if (message.includes('utilization') || message.includes('reduce') || message.includes('card limit')) {
            reply = 'Your current utilization is 32%. You can lower it by making a mid-cycle repayment before the bill generation date or requesting your bank for a credit limit increase.';
            chips = [
                'How to request a limit increase?',
                'Schedule credit consultation',
                'What is FOIR?'
            ];
        } else if (message.includes('limit increase') || message.includes('increase limit')) {
            reply = 'Banks usually consider credit limit increases every 6-12 months based on consistent timely repayments and income growth. You can request it directly via your net banking portal.';
            chips = [
                'How does limit increase help CIBIL?',
                'Schedule credit consultation'
            ];
        } else if (message.includes('inquiry') || message.includes('enquiry')) {
            reply = 'Hard inquiries impact 10% of your score and remain on record for 24 months. Applying for multiple loans within a short window can temporarily lower your score by 5-15 points.';
            chips = [
                'How to remove an inquiry?',
                'Apply for pre-approved loan'
            ];
        } else if (message.includes('dispute') || message.includes('wrong') || message.includes('mistake') || message.includes('remove')) {
            reply = 'If there is an erroneous account or delayed payment remark on your report, you can file an official dispute on CIBIL.com or book a consultation with our certified credit advisor.';
            chips = [
                'Schedule credit consultation',
                'How long does dispute resolution take?'
            ];
        }

        return sendSuccess(res, 200, 'Response generated.', {
            reply,
            suggested_chips: chips
        });
    } catch (e) {
        return sendError(res, 500, e.message);
    }
};

// 5.5 POST /api/cibil/consultation
export const bookConsultation = async (req, res) => {
    try {
        const { phone, preferred_slot, notes, scheduled_date } = req.body;
        if (!phone || !preferred_slot) return sendError(res, 422, 'phone and preferred_slot are required');
        const booking_code = 'CONS-' + Math.random().toString(36).toUpperCase().substring(2, 8);
        const consultation = new Consultation({
            user_id: req.user._id,
            phone,
            preferred_slot,
            notes,
            scheduled_date: scheduled_date || new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'CONFIRMED',
            booking_code
        });
        await consultation.save();

        // Send confirmation email to user if email available
        const userEmail = req.user?.email || req.body.email;
        const userName = req.user?.full_name || req.user?.name || 'Valued Customer';
        if (userEmail) {
            sendTemplateMail(userEmail, 'consultation_ticket_created', {
                ticket_id: booking_code,
                name: userName
            }).catch(err => console.error('Consultation user email failed:', err));
        }

        // Send alert email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'zerocommission@digivahan.in';
        sendTemplateMail(adminEmail, 'admin_consultation_alert', {
            ticket_id: booking_code,
            name: userName,
            phone,
            email: userEmail || 'N/A',
            subject: 'Credit Consultation Booking',
            issue: notes || `Preferred Slot: ${preferred_slot}`
        }).catch(err => console.error('Consultation admin alert failed:', err));

        return res.status(201).json({
            success: true,
            message: 'Credit consultation booked successfully.',
            data: {
                booking_id: `cons-${consultation._id}`,
                booking_code,
                status: 'CONFIRMED',
                phone,
                preferred_slot,
                scheduled_date: scheduled_date || new Date().toISOString().split('T')[0]
            }
        });
    } catch (e) { return sendError(res, 500, e.message); }
};
