import mongoose from 'mongoose';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { uploadToCloudinary } from '../../../services/cloudinary/cloudinary_upload.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';

export async function uploadDocs(req, res) {
    try {
        const document_id = (req.body.document_id || '').trim();
        const tokenOrId = (req.body.loan_application_id || req.body.token || req.body.application_token || '').trim();
        const document_status = (req.body.document_status || 'Under Review').trim();
        const remarks = (req.body.remarks || '').trim();

        if (!tokenOrId) {
            return res.json({ status: false, message: 'loan_application_id or token is required' });
        }

        const query = [{ application_token: tokenOrId }];
        if (mongoose.isValidObjectId(tokenOrId)) {
            query.push({ _id: tokenOrId });
        }
        const app = await LoanApplication.findOne({ $or: query }).lean();
        if (!app) return res.json({ status: false, message: 'Application not found' });

        const loan_application_id = app._id;

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        // Map file field names to DB column names (same as PHP)
        const fileFieldMap = {
            pancard:               'pancard_url',
            adharcard:             'adharcard_url',
            salary_slips:          'salary_slips_url',
            bank_statement:        'bank_statement_url',
            employment_letter:     'employment_letter_url',
            business_registration: 'business_registration_url',
            gst_returns:           'gst_returns_url',
            moa:                   'moa_url',
            otherdocs:             'otherdocs_url'
        };

        const updates = {};
        const uploadedDocs = {};

        if (req.files) {
            for (const [phpFieldName, dbField] of Object.entries(fileFieldMap)) {
                if (req.files[phpFieldName] && req.files[phpFieldName][0]) {
                    const file = req.files[phpFieldName][0];
                    try {
                        const result = await uploadToCloudinary(file.path, 'loan_docs', cloudName, apiKey, apiSecret);
                        if (result && result.url) {
                            updates[dbField] = result.url;
                            uploadedDocs[phpFieldName] = result.url;
                        }
                    } catch (uploadErr) {
                        return res.json({ status: false, message: `Upload failed for ${phpFieldName}: ${uploadErr.message}` });
                    }
                }
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.json({ status: false, message: 'No documents were uploaded' });
        }

        updates.document_status = document_status;
        updates.remarks = remarks || 'Documents uploaded by user';

        // Update or create document record
        if (document_id) {
            await LoanApplicationDocuments.updateOne({ _id: document_id, loan_application_id }, updates, { upsert: true });
        } else {
            const existing = await LoanApplicationDocuments.findOne({ loan_application_id });
            if (existing) {
                await LoanApplicationDocuments.updateOne({ _id: existing._id }, updates);
            } else {
                await LoanApplicationDocuments.create({ loan_application_id, ...updates });
            }
        }

        await LoanApplication.updateOne({ _id: loan_application_id }, { Document_Status: document_status, document_status: document_status });

        // Append to case_history (same as PHP addCaseHistory)
        const historyRecord = await LoanApplicationHistory.findOne({ loan_application_id }).lean();
        if (historyRecord) {
            let caseHistory = [];
            try {
                caseHistory = Array.isArray(historyRecord.case_history)
                    ? historyRecord.case_history
                    : JSON.parse(historyRecord.case_history || '[]');
            } catch (e) { caseHistory = []; }

            caseHistory.push({
                title: 'Documents Uploaded',
                datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                summary: 'User uploaded loan documents'
            });

            await LoanApplicationHistory.updateOne(
                { loan_application_id },
                { status: app.status, case_history: JSON.stringify(caseHistory) }
            );
        }

        // Build documentListHtml same as PHP sendDocumentSubmissionMail()
        const docLabels = {
            adharcard:             '✓ Aadhaar Card',
            pancard:               '✓ PAN Card',
            salary_slips:          '✓ Salary Slips',
            bank_statement:        '✓ Bank Statement',
            employment_letter:     '✓ Employment Letter',
            business_registration: '✓ Business Registration',
            gst_returns:           '✓ GST Returns',
            moa:                   '✓ MOA'
        };

        let documentListHtml = '';
        for (const [key, label] of Object.entries(docLabels)) {
            if (uploadedDocs[key]) {
                documentListHtml += `
                <tr>
                    <td style='padding:12px 15px;border-bottom:1px solid #e5e7eb;'>${label}</td>
                </tr>`;
            }
        }

        sendTemplateMail(app.email, 'Send_document_sumbition', {
            application_token: app.application_token,
            documentListHtml
        }).catch(() => {});

        return res.json({ status: true, message: 'Documents uploaded successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}