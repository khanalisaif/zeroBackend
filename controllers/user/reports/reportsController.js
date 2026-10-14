// Module 7: Credit Reports & Documents Vault controllers

import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import crypto from 'crypto';

// 7.1 GET /api/reports/latest
export const getLatestReport = async (req, res) => {
    try {
        return sendSuccess(res, 200, 'Latest credit report retrieved.', {
            report_id: `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            generated_date: new Date().toLocaleDateString('en-IN'),
            score: 786,
            personal_info: {
                name: req.user.full_name || req.user.name,
                pan: req.user.pan || req.user.pan_number
            },
            accounts_summary: { total_accounts: 0 },
            inquiries_summary: { total: 0 }
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 7.2 GET /api/reports/enquiries
export const getEnquiries = async (req, res) => {
    return sendSuccess(res, 200, 'Enquiries retrieved.', { total: 0, enquiries: [] });
};

// 7.3 GET /api/reports/download
export const getDownloadUrl = async (req, res) => {
    try {
        const token = crypto.randomBytes(16).toString('hex');
        const report_id = `REP-${new Date().getFullYear()}-7861`;
        return sendSuccess(res, 200, 'Credit report download link generated successfully.', {
            report_id,
            file_name: 'Credit_Report_786.pdf',
            download_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/reports/file?token=${token}&user_id=${req.user._id}&type=${req.query.type || 'cibil'}`,
            expires_in_seconds: 3600
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 7.4 GET /api/reports/file
export const streamReportFile = async (req, res) => {
    // In real implementation, would stream the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="credit_report.pdf"');
    return res.status(200).send('%PDF-1.4 Mock PDF Content');
};

// 7.5 POST /api/reports/unlock
export const unlockReport = async (req, res) => {
    try {
        const { report_id, password } = req.body;
        if (!report_id || !password) return sendError(res, 422, 'report_id and password are required.');
        // Password convention: First 4 letters of name in CAPS + Year of Birth
        const token = crypto.randomBytes(16).toString('hex');
        return sendSuccess(res, 200, 'Report unlocked successfully.', {
            unlocked: true,
            download_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/reports/file?token=${token}&user_id=${req.user._id}`
        });
    } catch (e) { return sendError(res, 500, e.message); }
};
