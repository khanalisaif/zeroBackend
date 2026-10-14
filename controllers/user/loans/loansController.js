// Module 8: Loans & Applications controller
// Docs: 8.1 check-eligibility, 8.2 list, 8.3 detail, 8.4 status, 8.5 apply

import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { User } from '../../../models/User.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

// 8.1 POST /api/loans/check-eligibility
export const checkEligibility = async (req, res) => {
    try {
        const { monthly_income = 0, existing_emis = 0, loan_type = 'personal', tenure_years, cibil_score = 786 } = req.body;
        if (!monthly_income) return sendError(res, 422, 'monthly_income is required.');
        const foir = 0.5; // max 50% of income can go to EMIs
        const available_for_emi = (monthly_income * foir) - existing_emis;
        const interest_rate = cibil_score >= 750 ? 10.75 : cibil_score >= 700 ? 12.0 : 14.0;
        const months = loan_type === 'home' ? (tenure_years || 20) * 12 : (tenure_years || 3) * 12;
        const r = interest_rate / 100 / 12;
        const eligible_loan_amount = Math.round(available_for_emi * ((Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months))));
        return sendSuccess(res, 200, 'Loan eligibility calculated successfully.', {
            eligible_loan_amount: Math.max(0, eligible_loan_amount),
            eligible_loan_amount_formatted: `₹ ${Math.max(0, eligible_loan_amount).toLocaleString('en-IN')}`,
            max_monthly_emi: Math.max(0, Math.round(available_for_emi)),
            max_monthly_emi_formatted: `₹ ${Math.max(0, Math.round(available_for_emi)).toLocaleString('en-IN')}`,
            interest_rate_percent: interest_rate,
            foir_percent: Math.round(((existing_emis / monthly_income) || 0) * 100),
            tenure_months: months,
            risk_level: cibil_score >= 750 ? 'LOW_RISK' : cibil_score >= 700 ? 'MEDIUM_RISK' : 'HIGH_RISK'
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 8.2 GET /api/loans/applications
export const getMyApplications = async (req, res) => {
    try {
        const filter = {
            $or: [
                { user_id: req.user._id },
                ...(req.user.email ? [{ email: { $regex: new RegExp(`^${req.user.email}$`, 'i') } }] : []),
                ...(req.user.number ? [{ number: req.user.number }] : []),
                ...(req.user.phone ? [{ number: req.user.phone }] : [])
            ]
        };

        if (req.query.status && req.query.status !== 'all') {
            const st = req.query.status.toLowerCase();
            if (st === 'approved') filter.status = { $in: ['Approved', 'APPROVED'] };
            else if (st === 'rejected') filter.status = { $in: ['Rejected', 'REJECTED'] };
            else if (st === 'in_progress') filter.status = { $nin: ['Approved', 'APPROVED', 'Rejected', 'REJECTED'] };
            else filter.status = new RegExp(`^${req.query.status}$`, 'i');
        }

        const apps = await LoanApplication.find(filter).sort({ created_at: -1 });

        return sendSuccess(res, 200, 'Loan applications retrieved.', {
            total_applications: apps.length,
            in_progress_count: apps.filter(a => !['approved', 'rejected'].includes((a.status || '').toLowerCase())).length,
            approved_count: apps.filter(a => (a.status || '').toLowerCase() === 'approved').length,
            rejected_count: apps.filter(a => (a.status || '').toLowerCase() === 'rejected').length,
            applications: apps.map(a => {
                const amt = a.amount || a.loan_amount || 0;
                return {
                    id: a.application_token || a._id.toString(),
                    loan_type: a.loan_type || 'Personal Loan',
                    amount: amt,
                    amount_formatted: `₹ ${Number(amt).toLocaleString('en-IN')}`,
                    tenure: a.tenure || '36 Months',
                    bank_name: a.bank_name || 'HDFC Bank',
                    status: a.status ? a.status.toUpperCase() : 'SUBMITTED',
                    stage_status: a.stage_status || (a.status === 'Approved' ? 'Loan Disbursed' : 'Application Received'),
                    progress_step: a.progress_step || 1,
                    applied_date: a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
                };
            })
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 8.3 GET /api/loans/applications/detail
export const getApplicationDetails = async (req, res) => {
    try {
        const appId = req.query.id;
        if (!appId) return sendError(res, 422, 'Application id query parameter is required.');

        const app = await LoanApplication.findOne({
            $and: [
                {
                    $or: [
                        ...(mongoose.isValidObjectId(appId) ? [{ _id: appId }] : []),
                        { application_token: appId }
                    ]
                },
                {
                    $or: [
                        { user_id: req.user._id },
                        ...(req.user.email ? [{ email: { $regex: new RegExp(`^${req.user.email}$`, 'i') } }] : []),
                        ...(req.user.number ? [{ number: req.user.number }] : []),
                        ...(req.user.phone ? [{ number: req.user.phone }] : [])
                    ]
                }
            ]
        });

        if (!app) return sendError(res, 404, 'Application not found.');

        const amt = app.amount || app.loan_amount || 0;
        const appDate = app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

        // Fetch docs if any
        const docRecord = await LoanApplicationDocuments.findOne({ loan_application_id: app._id }).lean();
        const docsList = [];
        if (docRecord) {
            ['pan_card', 'aadhaar_front', 'aadhaar_back', 'salary_slip', 'bank_statement'].forEach(field => {
                if (docRecord[field]) {
                    docsList.push({
                        doc_type: field,
                        file_name: docRecord[field].split('/').pop(),
                        status: docRecord.document_status || 'PENDING'
                    });
                }
            });
        }

        const stages = [
            {
                stage_order: 1,
                stage_title: 'Application Submitted',
                date_formatted: appDate,
                state: 'COMPLETED'
            },
            {
                stage_order: 2,
                stage_title: 'Document Verification',
                date_formatted: app.Document_Status === 'APPROVED' ? 'Completed' : 'Pending',
                state: app.Document_Status === 'APPROVED' ? 'COMPLETED' : 'CURRENT'
            },
            {
                stage_order: 3,
                stage_title: 'Credit Underwriting & Sanction',
                date_formatted: app.status === 'Approved' ? 'Completed' : 'Pending',
                state: app.status === 'Approved' ? 'COMPLETED' : 'PENDING'
            },
            {
                stage_order: 4,
                stage_title: 'Disbursal',
                date_formatted: app.status === 'Approved' ? 'Disbursed' : 'Pending',
                state: app.status === 'Approved' ? 'COMPLETED' : 'PENDING'
            }
        ];

        return sendSuccess(res, 200, 'Application detail retrieved.', {
            id: app.application_token || app._id.toString(),
            loan_type: app.loan_type || 'Loan',
            amount: amt,
            amount_formatted: `₹ ${Number(amt).toLocaleString('en-IN')}`,
            status: app.status ? app.status.toUpperCase() : 'SUBMITTED',
            bank_name: app.bank_name || 'HDFC Bank',
            timeline_stages: stages,
            documents: docsList
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 8.4 GET /api/loans/applications/status
export const trackApplication = async (req, res) => {
    try {
        const appId = req.query.id;
        if (!appId) return sendError(res, 422, 'Application id query parameter is required.');

        const app = await LoanApplication.findOne({
            $or: [
                ...(mongoose.isValidObjectId(appId) ? [{ _id: appId }] : []),
                { application_token: appId }
            ]
        });

        if (!app) return sendError(res, 404, 'Application not found.');

        const amt = app.amount || app.loan_amount || 0;
        const appDate = app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

        const stages = [
            { stage_order: 1, stage_title: 'Application Submitted', date_formatted: appDate, state: 'COMPLETED' },
            { stage_order: 2, stage_title: 'Document Verification', date_formatted: app.Document_Status === 'APPROVED' ? 'Completed' : 'In Progress', state: app.Document_Status === 'APPROVED' ? 'COMPLETED' : 'CURRENT' },
            { stage_order: 3, stage_title: 'Credit Underwriting & Sanction', date_formatted: 'Pending', state: 'PENDING' },
            { stage_order: 4, stage_title: 'Disbursal', date_formatted: 'Pending', state: 'PENDING' }
        ];

        return sendSuccess(res, 200, 'Application status retrieved successfully.', {
            application_id: app.application_token || app._id.toString(),
            loan_type: app.loan_type || 'Personal Loan',
            bank_name: app.bank_name || 'HDFC Bank',
            amount_formatted: `₹ ${Number(amt).toLocaleString('en-IN')}`,
            status: app.status ? app.status.toUpperCase() : 'SUBMITTED',
            stage_status: app.stage_status || (app.status === 'Approved' ? 'Loan Disbursed' : 'Application Received'),
            progress_step: app.progress_step || (app.Document_Status === 'APPROVED' ? 2 : 1),
            stages
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 8.5 POST /api/loans/apply
export const applyLoan = async (req, res) => {
    try {
        const {
            loan_type,
            amount,
            loan_amount,
            tenure,
            purpose,
            description,
            bank_name,
            employment_type,
            profession,
            company_name,
            business_name,
            annual_salary,
            annual_turnover,
            monthly_income,
            city,
            pan_number
        } = req.body;

        const finalAmount = amount || loan_amount;
        if (!loan_type || !finalAmount || !tenure) {
            return sendError(res, 422, 'loan_type, amount, and tenure are required.');
        }

        const user = req.user || {};
        const userName = (user.full_name || user.name || req.body.name || '').trim();
        const userPhone = (user.phone || user.number || req.body.number || '').trim();
        const userEmail = (user.email || req.body.email || '').trim();
        const cleanPan = (pan_number || user.pan || user.pan_number || '').toUpperCase();

        // Generate application_token (ZCL + Date + Random Hex)
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomHex = Math.floor(Math.random() * 0xFFFFF).toString(16).toUpperCase().padStart(5, '0');
        const application_token = `ZCL${datePart}${randomHex}`;

        const newApp = await LoanApplication.create({
            user_id: user._id || null,
            name: userName,
            number: userPhone,
            email: userEmail,
            loan_type,
            city: city || '',
            profession: profession || employment_type || '',
            pan_number: cleanPan,
            monthly_income: monthly_income ? String(monthly_income) : '',
            loan_amount: Number(finalAmount),
            tenure: String(tenure),
            description: purpose || description || '',
            business_name: company_name || business_name || '',
            bank_name: bank_name || 'Partner Bank',
            application_token,
            status: 'SUBMITTED',
            Document_Status: 'PENDING'
        });

        // Initialize history
        const caseHistory = [{
            title: 'Application Submitted',
            summary: 'Loan application submitted successfully.',
            datetime: new Date().toISOString(),
            status: 'Submitted'
        }];

        await LoanApplicationHistory.create({
            loan_application_id: newApp._id,
            status: 'Submitted',
            case_history: JSON.stringify(caseHistory)
        });

        // Initialize documents tracking
        await LoanApplicationDocuments.create({
            loan_application_id: newApp._id,
            document_status: 'PENDING'
        });

        // Link with user application_ids
        if (user._id) {
            let applications = [];
            if (user.application_ids) {
                try {
                    applications = JSON.parse(user.application_ids);
                    if (!Array.isArray(applications)) applications = [];
                } catch (e) {
                    applications = [];
                }
            }
            if (!applications.includes(newApp._id.toString())) {
                applications.push(newApp._id.toString());
            }
            await User.updateOne({ _id: user._id }, { application_ids: JSON.stringify(applications) });
        }

        // Send submission email if email is present
        if (userEmail) {
            sendTemplateMail(userEmail, 'application_submitted', { application_token })
                .then(mailRes => console.log('Loan application email dispatched successfully:', mailRes))
                .catch(mailErr => console.error('Loan application email failed:', mailErr));
        }

        const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        return res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully.',
            data: {
                id: application_token,
                application_id: application_token,
                loan_type,
                amount: Number(finalAmount),
                amount_formatted: `₹ ${Number(finalAmount).toLocaleString('en-IN')}`,
                tenure: String(tenure),
                bank_name: bank_name || 'Partner Bank',
                status: 'SUBMITTED',
                stage_status: 'Application Received',
                applied_date: formattedDate
            }
        });
    } catch (e) {
        return sendError(res, 500, e.message);
    }
};
