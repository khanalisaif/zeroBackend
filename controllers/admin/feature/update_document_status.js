import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function updateDocumentStatus(req, res) {
    try {
        const id = (req.body.id || '').trim();
        const loan_application_id = (req.body.loan_application_id || '').trim();
        const document_status = (req.body.document_status || '').trim();
        const remarks = (req.body.remarks || '').trim();

        if (!id || !loan_application_id || !document_status) {
            return res.json({ status: false, message: 'Missing fields: id, loan_application_id, document_status required' });
        }

        const app = await LoanApplication.findById(loan_application_id).lean();
        if (!app) return res.json({ status: false, message: 'Application not found' });

        // Update document record by id
        await LoanApplicationDocuments.updateOne(
            { _id: id, loan_application_id },
            { document_status, remarks },
            { upsert: true }
        );

        // Update main application document status
        await LoanApplication.updateOne({ _id: loan_application_id }, { Document_Status: document_status });

        // Update case history
        const historyRecord = await LoanApplicationHistory.findOne({ loan_application_id }).lean();
        if (historyRecord) {
            let caseHistory = [];
            try {
                caseHistory = Array.isArray(historyRecord.case_history)
                    ? historyRecord.case_history
                    : JSON.parse(historyRecord.case_history || '[]');
            } catch (e) { caseHistory = []; }

            caseHistory.push({
                title: 'Document Status Updated',
                datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                summary: remarks || `Document status updated to ${document_status}`
            });

            await LoanApplicationHistory.updateOne(
                { loan_application_id },
                { case_history: JSON.stringify(caseHistory) }
            );
        }

        // Send email with correct data keys matching PHP (applicationToken key)
        sendTemplateMail(app.email, 'loan_document_status', {
            applicationToken: app.application_token,
            document_status,
            remarks
        }).catch(() => {});

        return res.json({ status: true, message: 'Document status updated successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}