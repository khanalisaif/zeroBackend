// Module 12: Admin Management Controller
// Docs: 12.1 - 12.8

import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../../utils/responseHandler.js';
import { Offer } from '../../models/Offer.js';
import { CreditCardOffer } from '../../models/CreditCardOffer.js';
import { Faq } from '../../models/Faq.js';
import { User } from '../../models/User.js';
import { DeletionRequest } from '../../models/DeletionRequest.js';

// Helper to find document by ObjectId or custom id
function buildIdQuery(id) {
    if (mongoose.isValidObjectId(id)) {
        return { _id: id };
    }
    return { _id: null };
}

// ── 12.1 - 12.4 Loan Offers CRUD ──────────────────────────────────────────────

// 12.1 GET /api/admin/offers/index
export const getAdminOffers = async (req, res) => { 
    try {
        const query = {};
        if (req.query.status && req.query.status !== 'all') {
            query.is_active = req.query.status === 'active';
        }
        const offers = await Offer.find(query).sort({ created_at: -1 });
        return sendSuccess(res, 200, 'Loan offers retrieved.', {
            total: offers.length,
            offers: offers.map(o => ({
                id: o._id,
                title: o.title,
                category: o.category,
                bank_name: o.bank_name,
                bank_logo_url: o.bank_logo_url,
                banner_image_url: o.banner_image_url,
                badge_text: o.badge_text,
                interest_rate_value: o.interest_rate_value,
                interest_rate_formatted: o.interest_rate_formatted || `${o.interest_rate_value}% p.a.`,
                max_amount_value: o.max_amount_value,
                max_amount_formatted: o.max_amount_formatted || `₹ ${(o.max_amount_value || 0).toLocaleString('en-IN')}`,
                tenure_formatted: o.tenure_formatted,
                is_pre_approved: o.is_pre_approved,
                processing_fee: o.processing_fee,
                key_features: o.key_features || [],
                eligibility_criteria: o.eligibility_criteria || [],
                required_documents: o.required_documents || [],
                is_active: o.is_active
            }))
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// 12.2 POST /api/admin/offers/create
export const createAdminOffer = async (req, res) => {
    try {
        const {
            bank_name,
            title,
            category,
            interest_rate_value,
            interest_rate_formatted,
            max_amount_value,
            max_amount_formatted
        } = req.body;

        if (!bank_name || !title || !category || interest_rate_value === undefined || max_amount_value === undefined) {
            return sendError(res, 422, 'bank_name, title, category, interest_rate_value, and max_amount_value are required.');
        }

        const offer = new Offer({
            ...req.body,
            interest_rate_formatted: interest_rate_formatted || `${interest_rate_value}% p.a.`,
            max_amount_formatted: max_amount_formatted || `₹ ${Number(max_amount_value).toLocaleString('en-IN')}`
        });
        await offer.save();

        return res.status(201).json({
            success: true,
            message: 'Loan offer created successfully.',
            data: {
                id: offer._id,
                title: offer.title
            }
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// 12.3 POST/PUT /api/admin/offers/update
export const updateAdminOffer = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return sendError(res, 422, 'id query parameter or body is required.');

        const updateData = { ...req.body };
        delete updateData.id;

        const offer = await Offer.findOneAndUpdate(buildIdQuery(id), updateData, { new: true });
        if (!offer) return sendError(res, 404, 'Offer not found.');

        return sendSuccess(res, 200, 'Offer updated successfully.', { offer });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// 12.4 POST/DELETE /api/admin/offers/delete
export const deleteAdminOffer = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return sendError(res, 422, 'id query parameter is required.');

        const permanent = req.query.permanent === 'true' || req.body.permanent === true;
        if (permanent) {
            await Offer.findOneAndDelete(buildIdQuery(id));
        } else {
            await Offer.findOneAndUpdate(buildIdQuery(id), { is_active: false });
        }

        return sendSuccess(res, 200, 'Offer deleted successfully.', { id });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// ── 12.5 Credit Cards CRUD ───────────────────────────────────────────────────

// GET /api/admin/credit-cards/index
export const getAdminCards = async (req, res) => { 
    try {
        const query = {};
        if (req.query.status && req.query.status !== 'all') {
            query.is_active = req.query.status === 'active';
        }
        const cards = await CreditCardOffer.find(query).sort({ created_at: -1 });
        return sendSuccess(res, 200, 'Credit card offers retrieved successfully.', {
            total_cards: cards.length,
            cards
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST /api/admin/credit-cards/create
export const createAdminCard = async (req, res) => {
    try {
        const { card_name, bank_name } = req.body;
        if (!card_name || !bank_name) {
            return sendError(res, 422, 'card_name and bank_name are required.');
        }

        const card = new CreditCardOffer(req.body);
        await card.save();

        return res.status(201).json({
            success: true,
            message: 'Credit card created successfully.',
            data: { id: card._id }
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/PUT /api/admin/credit-cards/update
export const updateAdminCard = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return sendError(res, 422, 'id is required.');

        const card = await CreditCardOffer.findOneAndUpdate(buildIdQuery(id), req.body, { new: true });
        if (!card) return sendError(res, 404, 'Card not found.');

        return sendSuccess(res, 200, 'Card updated successfully.', { card });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/DELETE /api/admin/credit-cards/delete
export const deleteAdminCard = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return sendError(res, 422, 'id is required.');

        const permanent = req.query.permanent === 'true' || req.body.permanent === true;
        if (permanent) {
            await CreditCardOffer.findOneAndDelete(buildIdQuery(id));
        } else {
            await CreditCardOffer.findOneAndUpdate(buildIdQuery(id), { is_active: false });
        }

        return sendSuccess(res, 200, 'Card deleted successfully.', { id });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// ── 12.6 FAQs CRUD ───────────────────────────────────────────────────────────

// GET /api/admin/faqs/index
export const getAdminFaqs = async (req, res) => { 
    try {
        const query = {};
        if (req.query.category && req.query.category !== 'all') {
            query.category = req.query.category;
        }
        const faqs = await Faq.find(query);
        return sendSuccess(res, 200, 'FAQs retrieved successfully.', {
            total: faqs.length,
            faqs: faqs.map(f => ({
                id: f._id,
                question: f.question,
                answer: f.answer,
                category: f.category || 'general'
            }))
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST /api/admin/faqs/create
export const createAdminFaq = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        if (!question || !answer) {
            return sendError(res, 422, 'question and answer are required.');
        }

        const faq = new Faq({ question, answer, category: category || 'general' });
        await faq.save();

        return res.status(201).json({
            success: true,
            message: 'FAQ created successfully.',
            data: { id: faq._id }
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/PUT /api/admin/faqs/update
export const updateAdminFaq = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return sendError(res, 422, 'id is required.');

        const faq = await Faq.findOneAndUpdate(buildIdQuery(id), req.body, { new: true });
        if (!faq) return sendError(res, 404, 'FAQ not found.');

        return sendSuccess(res, 200, 'FAQ updated successfully.', { faq });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/DELETE /api/admin/faqs/delete
export const deleteAdminFaq = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return sendError(res, 422, 'id is required.');

        await Faq.findOneAndDelete(buildIdQuery(id));
        return sendSuccess(res, 200, 'FAQ deleted successfully.', { id });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// ── 12.7 Admin Support Settings ──────────────────────────────────────────────

let supportSettings = {
    phone: "1800-200-8899",
    phone_dial: "18002008899",
    phone_hours: "9 AM - 9 PM",
    email: "loans@zerocommission.finance",
    title: "Support & Help",
    chat_enabled: false
};

export const getAdminSupport = async (req, res) => {
    return sendSuccess(res, 200, 'Support settings retrieved successfully.', supportSettings);
};

export const updateAdminSupport = async (req, res) => {
    supportSettings = { ...supportSettings, ...req.body };
    return sendSuccess(res, 200, 'Support settings updated successfully.', supportSettings);
};

// ── 12.8 Admin Account Deletions Audit & Processing ──────────────────────────

export const getAccountDeletions = async (req, res) => { 
    try {
        const requests = await DeletionRequest.find({}).populate('user_id', 'full_name phone email');
        return sendSuccess(res, 200, 'Deletions retrieved successfully.', {
            total: requests.length,
            requests: requests.map(r => ({
                id: r._id,
                user: r.user_id,
                reason: r.reason,
                days_left: r.days_left,
                delete_date: r.delete_date,
                requested_at: r.created_at
            }))
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

export const processAccountDeletions = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (id) {
            // Immediate deletion of specific user
            const reqDoc = await DeletionRequest.findById(id);
            if (reqDoc) {
                await User.findByIdAndDelete(reqDoc.user_id);
                await DeletionRequest.findByIdAndDelete(id);
            }
            return sendSuccess(res, 200, 'Immediate deletion executed successfully.');
        } else {
            // Batch process due deletions
            const dueRequests = await DeletionRequest.find({ delete_date: { $lte: new Date() } });
            for (const r of dueRequests) {
                await User.findByIdAndDelete(r.user_id);
                await DeletionRequest.findByIdAndDelete(r._id);
            }
            return sendSuccess(res, 200, `Batch processed ${dueRequests.length} due deletions successfully.`);
        }
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

export const cancelAccountDeletion = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return sendError(res, 422, 'id is required.');

        const reqDoc = await DeletionRequest.findById(id);
        if (reqDoc) {
            await User.findByIdAndUpdate(reqDoc.user_id, {
                delete_account_status: false,
                delete_account_days_left: 0
            });
            await DeletionRequest.findByIdAndDelete(id);
        }
        return sendSuccess(res, 200, 'Deletion cancelled by admin successfully.', {
            reason: req.body.reason || 'User requested account reactivation via customer support.'
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};
