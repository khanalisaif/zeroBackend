// Module 11: Support, FAQs & Feedback controllers
// Docs: Module 11.1 - 11.5

import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import { Faq } from '../../../models/Faq.js';
import { ContactRequest } from '../../../models/ContactRequest.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

// Support settings (can be stored in DB or config — using env/hardcoded per doc)
const defaultSupportInfo = {
    phone: '1800-200-8899',
    phone_dial: '18002008899',
    phone_hours: '9 AM - 9 PM',
    email: 'loans@zerocommission.finance',
    title: 'Support & Help',
    subtitle: 'Our dedicated credit advisors are here to help resolve any questions about your loan applications.',
};

// 11.1 GET /api/support/index
export const getSupportInfo = async (req, res) => {
    try {
        const faqs = await Faq.find({}).limit(5);
        return sendSuccess(res, 200, 'Support information retrieved.', {
            ...defaultSupportInfo,
            faqs: faqs.map(f => ({
                id: f._id,
                question: f.question,
                answer: f.answer,
                category: f.category || 'general'
            }))
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 11.2 GET /api/support/faqs
export const getFaqs = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
        const faqs = await Faq.find(filter);
        return sendSuccess(res, 200, 'FAQs retrieved successfully.', {
            count: faqs.length,
            faqs: faqs.map(f => ({ id: f._id, question: f.question, answer: f.answer, category: f.category || 'general' }))
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 11.3 POST /api/support/query
export const submitQuery = async (req, res) => {
    try {
        const { loan_type, phone, message } = req.body;
        if (!loan_type || !phone || !message) return sendError(res, 422, 'loan_type, phone, and message are required.');
        const user = req.user || {};
        const userName = user.full_name || user.name || req.body.name || 'Applicant';
        const userEmail = user.email || req.body.email || '';

        const ticket = new ContactRequest({
            loan_type,
            phone: phone || user.phone || user.number,
            mobile: phone || user.phone || user.number,
            full_name: userName,
            email: userEmail,
            subject: `Support Query: ${loan_type}`,
            message,
            status: 'OPEN',
            created_at: new Date()
        });
        await ticket.save();

        // Dispatch confirmation email to user if email exists
        if (userEmail) {
            sendTemplateMail(userEmail, 'contact_request_received', {
                name: userName,
                full_name: userName,
                subject: `Support Query: ${loan_type}`,
                message
            }).catch(err => console.error('Support query user email failed:', err));
        }

        // Dispatch notification email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'zerocommission@digivahan.in';
        sendTemplateMail(adminEmail, 'admin_contact_alert', {
            name: userName,
            full_name: userName,
            phone: phone || user.phone || user.number,
            mobile: phone || user.phone || user.number,
            email: userEmail || 'N/A',
            subject: `[Support Query] ${loan_type}`,
            message
        }).catch(err => console.error('Support query admin email failed:', err));

        return res.status(201).json({
            success: true,
            message: 'Support query submitted successfully.',
            data: {
                ticket_id: `TICK-${ticket._id}`,
                status: 'OPEN',
                created_at: ticket.created_at
            }
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 11.4 GET /api/feedback/index
export const getFeedback = async (req, res) => {
    return sendSuccess(res, 200, 'Feedback history retrieved successfully.', {
        total_feedback: 0,
        feedbacks: []
    });
};

// 11.5 POST /api/feedback/index
export const submitFeedback = async (req, res) => {
    try {
        const { rating, category, comment } = req.body;
        if (!rating || !category || !comment) return sendError(res, 422, 'rating, category, and comment are required.');
        const id = 'FB-' + Math.floor(10000 + Math.random() * 90000);
        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully.',
            data: {
                id,
                rating,
                category,
                submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            }
        });
    } catch (e) { return sendError(res, 500, e.message); }
};
