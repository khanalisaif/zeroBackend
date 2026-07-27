import { User } from '../../../models/User.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';

export async function refreshApplication(req, res) {
    try {
        // Read Bearer token from Authorization header (same as PHP)
        const authHeader = req.headers['authorization'] || '';
        const match = authHeader.match(/Bearer\s+(.+)/i);
        if (!match) return res.json({ status: false, message: 'Access token is required' });
        const accessToken = match[1].trim();

        const user = await User.findOne({ access_token: accessToken }).lean();
        if (!user) return res.json({ status: false, message: 'Invalid access token' });

        if (user.account_status && user.account_status !== 'active')
            return res.json({ status: false, message: 'Account is not active' });

        if (new Date() > new Date(user.access_token_expires_at))
            return res.json({ status: false, message: 'Access token expired' });

        // Fetch latest loan application
        const app = await LoanApplication.findOne({ user_id: user._id }).sort({ _id: -1 }).lean();
        if (!app) return res.json({ status: false, message: 'Loan application not found' });

        const loanApplicationId = app._id;

        // Fetch latest history
        const history = await LoanApplicationHistory.findOne({ loan_application_id: loanApplicationId }).sort({ _id: -1 }).lean();

        let currentStatus = '';
        let timeline = [];
        if (history) {
            currentStatus = history.status || '';
            try { timeline = JSON.parse(history.case_history) || []; } catch { timeline = []; }
            if (!Array.isArray(timeline)) timeline = [];
        }

        // Fetch latest documents
        const docs = await LoanApplicationDocuments.findOne({ loan_application_id: loanApplicationId }).sort({ _id: -1 }).lean();

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
            document_ids: documentIds,
            current_status: currentStatus,
            timeline,
            document_status: documentStatus,
            remarks,
            last_updated_at: lastUpdatedAt,
            documents
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}