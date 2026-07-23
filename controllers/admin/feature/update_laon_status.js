import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function updateLoanStatus(req, res) {
    try {
        const loan_application_id = (req.body.loan_application_id || '').trim();
        const status = (req.body.status || '').trim();
        const remarks = (req.body.remarks || '').trim();

        if (!loan_application_id || !status) {
            return res.json({ status: false, message: 'Missing fields' });
        }

        const app = await LoanApplication.findById(loan_application_id).lean();
        if (!app) return res.json({ status: false, message: 'Application not found' });

        await LoanApplication.updateOne({ _id: loan_application_id }, { status });

        // Update case_history in LoanApplicationHistory (same as PHP addCaseHistory)
        const historyRecord = await LoanApplicationHistory.findOne({ loan_application_id }).lean();
        if (historyRecord) {
            let caseHistory = [];
            try {
                caseHistory = Array.isArray(historyRecord.case_history)
                    ? historyRecord.case_history
                    : JSON.parse(historyRecord.case_history || '[]');
            } catch (e) { caseHistory = []; }

            caseHistory.push({
                title: 'Status Updated',
                datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                summary: remarks || `Loan status updated to ${status}`
            });

            await LoanApplicationHistory.updateOne(
                { loan_application_id },
                { status, case_history: JSON.stringify(caseHistory) }
            );
        } else {
            await LoanApplicationHistory.create({
                loan_application_id,
                status,
                case_history: JSON.stringify([{
                    title: 'Status Updated',
                    datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    summary: remarks || `Loan status updated to ${status}`
                }])
            });
        }

        sendTemplateMail(app.email, 'loan_status_update', {
            application_token: app.application_token,
            status,
            remarks
        }).catch(() => {});

        return res.json({ status: true, message: 'Loan status updated successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}