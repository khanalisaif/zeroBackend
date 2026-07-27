import { ContactRequest } from '../../../../models/ContactRequest.js';
import { sendTemplateMail } from '../../../../services/email/mail_helper.js';

export async function createContact(req, res) {
    try {
        const { full_name, mobile, email, subject, message } = req.body;
        if (!full_name || !mobile || !email || !subject || !message) {
            return res.json({ status: false, message: 'All fields required' });
        }
        await ContactRequest.create({ full_name, mobile, email, subject, message });

        // Send email to User
        if (email) {
            sendTemplateMail(email, 'contact_request_received', {
                full_name,
                name: full_name,
                subject,
                message
            }).catch(() => {});
        }

        // Send alert email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.GRAPH_SENDER_EMAIL || 'zerocommission@digivahan.in';
        sendTemplateMail(adminEmail, 'admin_contact_alert', {
            name: full_name,
            phone: mobile,
            email,
            subject,
            message
        }).catch(() => {});

        return res.json({ status: true, message: 'Request submitted' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}