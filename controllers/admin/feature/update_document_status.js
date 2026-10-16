import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { VaultDocument } from '../../../models/VaultDocument.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import mongoose from 'mongoose';

export async function updateDocumentStatus(req, res) {
    try {
        const id = (req.body.id || '').trim();
        const loan_application_id = (req.body.loan_application_id || '').trim();
        const document_status = (req.body.document_status || '').trim();
        const remarks = (req.body.remarks || '').trim();

        if (!id || !loan_application_id || !document_status) {
            return res.status(400).json({ status: false, success: false, message: 'Missing fields: id, loan_application_id, document_status required' });
        }

        let app = null;
        if (mongoose.Types.ObjectId.isValid(loan_application_id)) {
            app = await LoanApplication.findById(loan_application_id).lean();
        }
        if (!app) {
            app = await LoanApplication.findOne({
                $or: [
                    { application_token: loan_application_id },
                    { application_id: loan_application_id }
                ]
            }).lean();
        }

        if (!app) return res.status(404).json({ status: false, success: false, message: 'Application not found' });

        // 1. If id is a VaultDocument (e.g. DOC-XXXXXX)
        if (id.toUpperCase().startsWith('DOC-')) {
            await VaultDocument.updateOne(
                { doc_id: id.toUpperCase() },
                { status: document_status }
            );
        } else if (mongoose.Types.ObjectId.isValid(id)) {
            await VaultDocument.updateOne(
                { _id: id },
                { status: document_status }
            );
        }

        // 2. Update LoanApplicationDocuments record
        if (mongoose.Types.ObjectId.isValid(id)) {
            await LoanApplicationDocuments.updateOne(
                { _id: id, loan_application_id: app._id },
                { document_status, remarks },
                { upsert: true }
            );
        } else {
            await LoanApplicationDocuments.updateOne(
                { loan_application_id: app._id },
                { document_status, remarks }
            );
        }

        // 3. Update main application document status
        await LoanApplication.updateOne({ _id: app._id }, { Document_Status: document_status });

        // 4. Update case history
        const historyRecord = await LoanApplicationHistory.findOne({ loan_application_id: app._id }).lean();
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
                { loan_application_id: app._id },
                { case_history: JSON.stringify(caseHistory) }
            );
        }

        // 5. Send notification email to user if email exists
        if (app.email) {
            sendTemplateMail(app.email, 'loan_document_status', {
                applicationToken: app.application_token,
                document_status,
                remarks
            }).catch(() => {});
        }

        return res.json({
            status: true,
            success: true,
            message: 'Document status updated successfully'
        });
    } catch (err) {
        return res.status(500).json({ status: false, success: false, message: 'Server error', error: err.message });
    }
}