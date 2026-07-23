import { User } from '../../../models/User.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';

export async function refreshApplication(req, res) {
    try {
        const accessToken = (req.body.access_token || '').trim();
        if (!accessToken) return res.json({ status: false, message: 'Access token required' });

        const user = await User.findOne({ access_token: accessToken }).lean();
        if (!user) return res.json({ status: false, message: 'Invalid token' });

        if (new Date() > new Date(user.access_token_expires_at)) {
            return res.json({ status: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }

        const app = await LoanApplication.findOne({ user_id: user._id }).sort({ _id: -1 }).lean();
        if (!app) return res.json({ status: true, data: { status: 'Pending', remarks: 'No active applications' } });

        const history = await LoanApplicationHistory.findOne({ loan_application_id: app._id }).sort({ _id: -1 }).lean();
        const docs = await LoanApplicationDocuments.findOne({ loan_application_id: app._id }).sort({ _id: -1 }).lean();

        return res.json({
            status: true,
            data: {
                id: app._id,
                status: history ? history.status : app.status,
                remarks: history ? history.case_history : '',
                document_status: docs ? docs.document_status : 'Pending',
                documents: docs
            }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}