import { User } from '../../../models/User.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';

export async function refreshApplication(req, res) {
    try {
        const authHeader = req.headers['authorization'] || '';
        const match = authHeader.match(/Bearer\s+(.+)/i);
        const bearerToken = match ? match[1].trim() : '';

        const tokenParam = (req.body.token || req.body.application_token || req.body.loan_application_id || bearerToken || '').trim();

        if (!tokenParam) {
            return res.json({ status: false, message: 'Token or Application ID is required' });
        }

        let app = null;
        let user = null;

        if (bearerToken) {
            user = await User.findOne({ access_token: bearerToken }).lean();
            if (user) {
                if (user.account_status && user.account_status !== 'active')
                    return res.json({ status: false, message: 'Account is not active' });
                if (user.access_token_expires_at && new Date() > new Date(user.access_token_expires_at))
                    return res.json({ status: false, message: 'Access token expired' });
            }
        }

        const queryConditions = [];

        if (tokenParam) {
            queryConditions.push({ application_token: tokenParam });
            if (/^[0-9a-fA-F]{24}$/.test(tokenParam)) {
                queryConditions.push({ _id: tokenParam });
            }
        }

        if (bearerToken && bearerToken !== tokenParam) {
            queryConditions.push({ application_token: bearerToken });
            if (/^[0-9a-fA-F]{24}$/.test(bearerToken)) {
                queryConditions.push({ _id: bearerToken });
            }
        }

        if (user) {
            queryConditions.push({ user_id: user._id });
            if (user.email) {
                queryConditions.push({ email: { $regex: new RegExp(`^${user.email}$`, 'i') } });
            }
        }

        if (queryConditions.length > 0) {
            app = await LoanApplication.findOne({ $or: queryConditions }).sort({ _id: -1 }).lean();
        }

        if (!app) return res.json({ status: false, message: 'Loan application not found or invalid token' });

        const loanApplicationId = app._id;

        const historyList = await LoanApplicationHistory.find({ loan_application_id: loanApplicationId }).sort({ _id: 1 }).lean();
        const docs = await LoanApplicationDocuments.findOne({ loan_application_id: loanApplicationId }).sort({ _id: -1 }).lean();

        const latestHistory = historyList.length ? historyList[historyList.length - 1] : null;
        const currentStatus = latestHistory?.status || app.status || 'Pending';
        let timeline = [];
        if (latestHistory && latestHistory.case_history) {
            try {
                const parsed = typeof latestHistory.case_history === 'string'
                    ? JSON.parse(latestHistory.case_history)
                    : latestHistory.case_history;
                if (Array.isArray(parsed)) timeline = parsed;
            } catch (_) {
                timeline = [];
            }
        }
        if (timeline.length === 0) {
            timeline.push({
                title: 'Application Submitted',
                summary: 'Loan application submitted successfully.',
                datetime: app.created_at ? app.created_at.toISOString() : null,
            });
            if (docs && docs.created_at) {
                timeline.push({
                    title: 'Documents Uploaded',
                    summary: 'Documents submitted successfully.',
                    datetime: docs.created_at.toISOString(),
                });
            }
            for (const h of historyList) {
                if (h.status && !['Pending', 'pending'].includes(h.status)) {
                    timeline.push({
                        title: h.status,
                        summary: h.case_history || '',
                        datetime: h.created_at ? h.created_at.toISOString() : null,
                    });
                }
            }
        }

        let documentStatus = '';
        let remarks = '';
        let lastUpdatedAt = '';
        let documents = [];
        let documentIds = [];

        if (docs) {
            documentIds.push(docs._id);
            documentStatus = docs.document_status || '';
            remarks = docs.remarks || '';
            lastUpdatedAt = docs.uploaded_at || docs.updated_at || '';

            const documentMap = {
                'Aadhaar Card': 'adharcard_url',
                'PAN Card': 'pancard_url',
                'Salary Slips': 'salary_slips_url',
                'Bank Statement': 'bank_statement_url',
                'Employment Letter': 'employment_letter_url',
                'Business Registration': 'business_registration_url',
                'GST Returns': 'gst_returns_url',
                'MOA': 'moa_url',
                'Other Documents': 'otherdocs_url'
            };

            for (const [documentName, columnName] of Object.entries(documentMap)) {
                if (docs[columnName]) {
                    documents.push({
                        document_name: documentName,
                        url: docs[columnName],
                        upload_time: docs.uploaded_at || docs.updated_at || ''
                    });
                }
            }
        }

        return res.json({
            status: true,
            message: 'Data fetched successfully',
            loan_application_id: loanApplicationId,
            application_token: app.application_token || app._id?.toString() || '',
            name: app.name || (user ? user.name : 'User'),
            phone: app.number || (user ? user.number : ''),
            loan_type: app.loan_type || '',
            document_ids: documentIds,
            current_status: currentStatus,
            timeline,
            document_status: documentStatus,
            remarks,
            summary: remarks,
            last_updated_at: lastUpdatedAt,
            created_at: app.created_at || null,
            documents
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}