import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function deleteLoanApplication(req, res) {
    try {
        const loan_application_id = (req.body.loan_application_id || '').trim();
        if (!loan_application_id) {
            return res.json({ status: false, message: 'loan_application_id is required' });
        }

        const app = await LoanApplication.findById(loan_application_id).lean();
        if (!app) return res.json({ status: false, message: 'Application not found' });

        // Delete related records (same as PHP which cascades)
        await LoanApplicationDocuments.deleteMany({ loan_application_id });
        await LoanApplicationHistory.deleteMany({ loan_application_id });
        await LoanApplication.deleteOne({ _id: loan_application_id });

        // Send deletion notification email (same as PHP)
        sendTemplateMail(app.email, 'loan_application_deleted', {
            application_token: app.application_token
        }).catch(() => {});

        return res.json({ status: true, message: 'Loan application deleted successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}