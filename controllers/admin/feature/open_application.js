import { LoanApplication } from '../../../models/LoanApplication.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function openApplication(req, res) {
    try {
        const id = (req.query.id || req.body.id || req.query.loan_application_id || req.body.loan_application_id || '').trim();
        if (!id) return res.json({ status: false, message: 'ID required' });

        const app = await LoanApplication.findById(id).lean();
        if (!app) return res.json({ status: false, message: 'Application not found' });

        if (!app.is_viewed) {
            await LoanApplication.updateOne({ _id: id }, { is_viewed: true, viewed_at: new Date() });
            if (app.email) {
                sendTemplateMail(app.email, 'loan_application_under_review', {
                    application_token: app.application_token
                }).catch(() => {});
            }
        }

        return res.json({ status: true, data: app });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}