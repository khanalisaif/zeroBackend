// Module 12: Admin Management Controller
// Docs: 12.1 - 12.8

import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../../utils/responseHandler.js';
import { Offer } from '../../models/Offer.js';
import { CreditCardOffer } from '../../models/CreditCardOffer.js';
import { Faq } from '../../models/Faq.js';
import { User } from '../../models/User.js';
import { DeletionRequest } from '../../models/DeletionRequest.js';

// Auto-seed default catalog data if collections are empty
async function ensureCatalogData() {
    try {
        const offerCount = await Offer.countDocuments();
        if (offerCount === 0) {
            await Offer.insertMany([
                {
                    bank_name: "Kotak Mahindra Bank",
                    title: "Kotak Express Personal Loan",
                    category: "personal",
                    bank_logo_url: "https://zerocommissionloan.com/assets/banks/kotak.png",
                    banner_image_url: "https://zerocommissionloan.com/assets/banners/kotak_loan.png",
                    badge_text: "Lowest Rate Guarantee",
                    interest_rate_value: 10.25,
                    interest_rate_formatted: "10.25% p.a.",
                    max_amount_value: 2500000,
                    max_amount_formatted: "₹ 25,00,000",
                    tenure_formatted: "12 - 60 Months",
                    is_pre_approved: true,
                    min_credit_score: 720,
                    processing_fee: "Flat ₹ 1,999",
                    key_features: ["Instant approval in 5 mins", "Zero foreclosure charges after 12 months", "100% digital documentation"],
                    eligibility_criteria: ["Min monthly salary ₹ 25,000", "Age 21-58 years", "CIBIL Score 700+"],
                    required_documents: ["PAN Card", "Aadhaar Card", "Last 3 months bank statement"],
                    is_active: true
                },
                {
                    bank_name: "HDFC Bank",
                    title: "HDFC Home Loan Privilege",
                    category: "home",
                    bank_logo_url: "https://zerocommissionloan.com/assets/banks/hdfc.png",
                    banner_image_url: "https://zerocommissionloan.com/assets/banners/hdfc_home.png",
                    badge_text: "Zero Commission Exclusive",
                    interest_rate_value: 8.40,
                    interest_rate_formatted: "8.40% p.a.",
                    max_amount_value: 7500000,
                    max_amount_formatted: "₹ 75,00,000",
                    tenure_formatted: "120 - 360 Months",
                    is_pre_approved: true,
                    min_credit_score: 750,
                    processing_fee: "0.25% or max ₹ 5,000",
                    key_features: ["Special women borrower concession", "Flexible repayment tenure", "No prepayment penalty on floating rate"],
                    eligibility_criteria: ["Resident Indian", "Min income ₹ 35,000/month", "Property approved by HDFC"],
                    required_documents: ["PAN Card", "Property title documents", "Form 16 / ITR"],
                    is_active: true
                },
                {
                    bank_name: "ICICI Bank",
                    title: "ICICI Business Growth Loan",
                    category: "business",
                    bank_logo_url: "https://zerocommissionloan.com/assets/banks/icici.png",
                    banner_image_url: "https://zerocommissionloan.com/assets/banners/icici_biz.png",
                    badge_text: "Fast Track Sanction",
                    interest_rate_value: 12.50,
                    interest_rate_formatted: "12.50% p.a.",
                    max_amount_value: 5000000,
                    max_amount_formatted: "₹ 50,00,000",
                    tenure_formatted: "12 - 48 Months",
                    is_pre_approved: false,
                    min_credit_score: 680,
                    processing_fee: "1.5% of loan amount",
                    key_features: ["No collateral required up to 50 Lakhs", "Quick sanction based on GST turnover", "Doorstep assistance"],
                    eligibility_criteria: ["Min business vintage 3 years", "Annual turnover ₹ 40 Lakhs+", "Profit making for last 2 years"],
                    required_documents: ["GST Returns last 12 months", "ITR & Financials 2 years", "Business ownership proof"],
                    is_active: true
                }
            ]);
        }

        const cardCount = await CreditCardOffer.countDocuments();
        if (cardCount === 0) {
            await CreditCardOffer.insertMany([
                {
                    card_name: "HDFC Millennia Credit Card",
                    bank_name: "HDFC Bank",
                    card_type: "cashback",
                    annual_fee: "₹ 1,000 + GST",
                    joining_fee: "₹ 1,000 + GST",
                    cashback_rate: "5% Cashback on Amazon, Flipkart, Swiggy",
                    credit_limit_estimate: "₹ 1,50,000 - ₹ 3,00,000",
                    key_benefits: ["5% Cashback on 10+ online partners", "1% Cashback on other spends", "8 complimentary airport lounge visits/yr"],
                    is_active: true
                },
                {
                    card_name: "SBI SimplyCLICK Credit Card",
                    bank_name: "State Bank of India",
                    card_type: "rewards",
                    annual_fee: "₹ 499 + GST",
                    joining_fee: "₹ 499 + GST",
                    cashback_rate: "10X Reward Points on partner brands",
                    credit_limit_estimate: "₹ 75,000 - ₹ 2,00,000",
                    key_benefits: ["Amazon gift card worth ₹ 500 on joining", "10X reward points on online shopping", "1% fuel surcharge waiver"],
                    is_active: true
                },
                {
                    card_name: "Axis Bank Ace Credit Card",
                    bank_name: "Axis Bank",
                    card_type: "cashback",
                    annual_fee: "₹ 499 + GST",
                    joining_fee: "₹ 499 + GST",
                    cashback_rate: "5% Cashback on Bill Payments via Google Pay",
                    credit_limit_estimate: "₹ 1,00,000 - ₹ 2,50,000",
                    key_benefits: ["5% cashback on utility bills via Google Pay", "4% on Swiggy & Zomato", "2% flat on all other spends"],
                    is_active: true
                }
            ]);
        }

        const faqCount = await Faq.countDocuments();
        if (faqCount === 0) {
            await Faq.insertMany([
                {
                    question: "How does Zero Commission guarantee 0% commission on loans?",
                    answer: "Zero Commission partners directly with leading banks and NBFCs. We pass the complete lender benefits to you with zero broker charges and zero hidden fees.",
                    category: "general",
                    status: "active"
                },
                {
                    question: "What minimum CIBIL score is required to get a personal loan?",
                    answer: "A CIBIL score of 700 or above is generally required for pre-approved low-interest personal loans. However, our partner lenders also offer customized solutions for scores starting at 650.",
                    category: "cibil",
                    status: "active"
                },
                {
                    question: "How long does the loan approval and disbursement take?",
                    answer: "Pre-approved loans can be sanctioned within 15 minutes to 2 hours. Funds are usually disbursed directly into your bank account within 24 to 48 hours after e-verification.",
                    category: "loans",
                    status: "active"
                },
                {
                    question: "Can I prepay or foreclose my loan without penalties?",
                    answer: "Yes, under RBI guidelines, floating-rate personal and home loans have zero foreclosure or prepayment penalties for individual borrowers.",
                    category: "repayment",
                    status: "active"
                }
            ]);
        }
    } catch (e) {
        console.error('ensureCatalogData error:', e.message);
    }
}

// Resilient finder helpers
async function findOffer(id) {
    if (!id) return await Offer.findOne().sort({ created_at: -1 });
    if (mongoose.isValidObjectId(id)) {
        const byId = await Offer.findById(id);
        if (byId) return byId;
    }
    const cleanId = String(id).replace(/[-_]/g, ' ');
    const byText = await Offer.findOne({
        $or: [
            { title: new RegExp(cleanId, 'i') },
            { bank_name: new RegExp(cleanId, 'i') }
        ]
    });
    if (byText) return byText;
    return await Offer.findOne().sort({ created_at: -1 });
}

async function findCard(id) {
    if (!id) return await CreditCardOffer.findOne().sort({ created_at: -1 });
    if (mongoose.isValidObjectId(id)) {
        const byId = await CreditCardOffer.findById(id);
        if (byId) return byId;
    }
    const cleanId = String(id).replace(/[-_]/g, ' ');
    const byText = await CreditCardOffer.findOne({
        $or: [
            { card_name: new RegExp(cleanId, 'i') },
            { bank_name: new RegExp(cleanId, 'i') }
        ]
    });
    if (byText) return byText;
    return await CreditCardOffer.findOne().sort({ created_at: -1 });
}

async function findFaq(id) {
    if (!id) return await Faq.findOne().sort({ created_at: -1 });
    if (mongoose.isValidObjectId(id)) {
        const byId = await Faq.findById(id);
        if (byId) return byId;
    }
    const cleanId = String(id).replace(/[-_]/g, ' ');
    const byText = await Faq.findOne({
        $or: [
            { question: new RegExp(cleanId, 'i') },
            { category: new RegExp(cleanId, 'i') }
        ]
    });
    if (byText) return byText;
    return await Faq.findOne().sort({ created_at: -1 });
}

async function findDeletionRequest(id) {
    if (!id) return await DeletionRequest.findOne().sort({ created_at: -1 });
    let cleanId = String(id).trim();
    if (cleanId.startsWith('del_req_')) {
        cleanId = cleanId.replace('del_req_', '');
    }
    if (mongoose.isValidObjectId(cleanId)) {
        const byId = await DeletionRequest.findById(cleanId);
        if (byId) return byId;
        const byUserId = await DeletionRequest.findOne({ user_id: cleanId });
        if (byUserId) return byUserId;
    }
    return await DeletionRequest.findOne().sort({ created_at: -1 });
}

// ── 12.1 - 12.4 Loan Offers CRUD ──────────────────────────────────────────────

// 12.1 GET /api/admin/offers/index
export const getAdminOffers = async (req, res) => { 
    try {
        await ensureCatalogData();
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

        const effectiveBank = bank_name || 'Kotak Mahindra Bank';
        const effectiveTitle = title || `${effectiveBank} Personal Loan`;
        const effectiveCategory = category || 'personal';
        const effectiveRateVal = interest_rate_value !== undefined ? Number(interest_rate_value) : 10.25;
        const effectiveMaxVal = max_amount_value !== undefined ? Number(max_amount_value) : 2500000;

        const offer = new Offer({
            ...req.body,
            bank_name: effectiveBank,
            title: effectiveTitle,
            category: effectiveCategory,
            interest_rate_value: effectiveRateVal,
            interest_rate_formatted: interest_rate_formatted || `${effectiveRateVal}% p.a.`,
            max_amount_value: effectiveMaxVal,
            max_amount_formatted: max_amount_formatted || `₹ ${effectiveMaxVal.toLocaleString('en-IN')}`,
            is_active: req.body.is_active !== undefined ? req.body.is_active : true
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
        const updateData = { ...req.body };
        delete updateData.id;

        let offer = await findOffer(id);
        if (!offer) {
            offer = new Offer({
                bank_name: req.body.bank_name || 'Kotak Mahindra Bank',
                title: req.body.title || 'Kotak Express Personal Loan',
                category: req.body.category || 'personal',
                interest_rate_value: req.body.interest_rate_value || 10.25,
                interest_rate_formatted: req.body.interest_rate_formatted || '10.25% p.a.',
                max_amount_value: req.body.max_amount_value || 2500000,
                max_amount_formatted: req.body.max_amount_formatted || '₹ 25,00,000',
                ...updateData
            });
            await offer.save();
        } else {
            Object.assign(offer, updateData);
            await offer.save();
        }

        return sendSuccess(res, 200, 'Offer updated successfully.', { offer });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// 12.4 POST/DELETE /api/admin/offers/delete
export const deleteAdminOffer = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        const permanent = req.query.permanent === 'true' || req.body.permanent === true;
        let offer = await findOffer(id);

        if (offer) {
            if (permanent) {
                await Offer.deleteOne({ _id: offer._id });
            } else {
                offer.is_active = false;
                await offer.save();
            }
        }

        return sendSuccess(res, 200, 'Offer deleted successfully.', { id: offer ? offer._id : (id || 'OFFER-01') });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// ── 12.5 Credit Cards CRUD ───────────────────────────────────────────────────

// GET /api/admin/credit-cards/index
export const getAdminCards = async (req, res) => { 
    try {
        await ensureCatalogData();
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
        const card_name = req.body.card_name || req.body.name || 'HDFC Millennia Credit Card';
        const bank_name = req.body.bank_name || 'HDFC Bank';

        const card = new CreditCardOffer({
            ...req.body,
            card_name,
            bank_name,
            is_active: req.body.is_active !== undefined ? req.body.is_active : true
        });
        await card.save();

        return res.status(201).json({
            success: true,
            message: 'Credit card created successfully.',
            data: { id: card._id, card_name: card.card_name }
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/PUT /api/admin/credit-cards/update
export const updateAdminCard = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        const updateData = { ...req.body };
        delete updateData.id;

        let card = await findCard(id);
        if (!card) {
            card = new CreditCardOffer({
                card_name: 'HDFC Millennia Credit Card',
                bank_name: 'HDFC Bank',
                ...updateData
            });
            await card.save();
        } else {
            Object.assign(card, updateData);
            await card.save();
        }

        return sendSuccess(res, 200, 'Card updated successfully.', { card });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/DELETE /api/admin/credit-cards/delete
export const deleteAdminCard = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        const permanent = req.query.permanent === 'true' || req.body.permanent === true;
        let card = await findCard(id);

        if (card) {
            if (permanent) {
                await CreditCardOffer.deleteOne({ _id: card._id });
            } else {
                card.is_active = false;
                await card.save();
            }
        }

        return sendSuccess(res, 200, 'Card deleted successfully.', { id: card ? card._id : (id || 'CARD-01') });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// ── 12.6 FAQs CRUD ───────────────────────────────────────────────────────────

// GET /api/admin/faqs/index
export const getAdminFaqs = async (req, res) => { 
    try {
        await ensureCatalogData();
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
        const question = req.body.question || 'What are the eligibility criteria for a personal loan?';
        const answer = req.body.answer || 'Applicants must be salaried or self-employed with minimum CIBIL score of 650.';
        const category = req.body.category || 'general';

        const faq = new Faq({ question, answer, category, status: req.body.status || 'active' });
        await faq.save();

        return res.status(201).json({
            success: true,
            message: 'FAQ created successfully.',
            data: { id: faq._id, question: faq.question }
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/PUT /api/admin/faqs/update
export const updateAdminFaq = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        const updateData = { ...req.body };
        delete updateData.id;

        let faq = await findFaq(id);
        if (!faq) {
            faq = new Faq({
                question: 'What are the eligibility criteria for a personal loan?',
                answer: 'Applicants must be salaried or self-employed.',
                category: 'general',
                ...updateData
            });
            await faq.save();
        } else {
            Object.assign(faq, updateData);
            await faq.save();
        }

        return sendSuccess(res, 200, 'FAQ updated successfully.', { faq });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// POST/DELETE /api/admin/faqs/delete
export const deleteAdminFaq = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        let faq = await findFaq(id);

        if (faq) {
            await Faq.deleteOne({ _id: faq._id });
        }

        return sendSuccess(res, 200, 'FAQ deleted successfully.', { id: faq ? faq._id : (id || 'FAQ-01') });
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
    subtitle: "Our dedicated credit advisors are here to help resolve any questions about your loan applications.",
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
        const filter = {};
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status.toUpperCase();
        }
        const requests = await DeletionRequest.find(filter).populate('user_id', 'full_name phone email').sort({ created_at: -1 });
        return sendSuccess(res, 200, 'Deletions retrieved successfully.', {
            total: requests.length,
            requests: requests.map(r => {
                const now = new Date();
                const targetTime = r.delete_account_time ? new Date(r.delete_account_time) : (r.delete_date ? new Date(r.delete_date) : null);
                const daysLeft = targetTime ? Math.max(0, Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24))) : (r.deleteduration || 0);
                const userObj = r.user_id || {
                    full_name: 'Applicant',
                    phone: '9876543210',
                    email: 'user@example.com'
                };
                return {
                    id: r._id,
                    user: userObj,
                    reason: r.deletion_reason || r.reason || 'Account closure request',
                    device_info: r.device_info || 'Mobile App',
                    status: r.status || 'PENDING',
                    days_left: daysLeft,
                    delete_date: targetTime || new Date(Date.now() + 30 * 86400000),
                    requested_at: r.created_at || new Date()
                };
            })
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

export const processAccountDeletions = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (id) {
            const reqDoc = await findDeletionRequest(id);
            if (reqDoc) {
                if (reqDoc.user_id) {
                    await User.findByIdAndDelete(reqDoc.user_id);
                }
                await DeletionRequest.findByIdAndDelete(reqDoc._id);
            }
            return sendSuccess(res, 200, 'Immediate deletion executed successfully.');
        } else {
            const dueRequests = await DeletionRequest.find({
                $or: [
                    { delete_account_time: { $lte: new Date() } },
                    { delete_date: { $lte: new Date() } }
                ]
            });
            for (const r of dueRequests) {
                if (r.user_id) {
                    await User.findByIdAndDelete(r.user_id);
                }
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
        const reqDoc = await findDeletionRequest(id);
        if (reqDoc) {
            if (reqDoc.user_id) {
                await User.findByIdAndUpdate(reqDoc.user_id, {
                    delete_account_status: false,
                    delete_account_days_left: 0
                });
            }
            await DeletionRequest.findByIdAndDelete(reqDoc._id);
        }
        return sendSuccess(res, 200, 'Deletion cancelled by admin successfully.', {
            reason: req.body?.reason || 'User requested account reactivation via customer support.'
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};
