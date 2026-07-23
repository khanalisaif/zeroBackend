import { ContactRequest } from '../../../../models/ContactRequest.js';
import { sendTemplateMail } from '../../../../services/email/mail_helper.js';
export async function createContact(req, res) {
    try {
        const { full_name, mobile, email, subject, message } = req.body;
        if (!full_name || !mobile || !email || !subject || !message) return res.json({ status: false, message: 'All fields required' });
        await ContactRequest.create({ full_name, mobile, email, subject, message });
        sendTemplateMail(email, 'contact_request_received', { full_name }).catch(() => {});
        return res.json({ status: true, message: 'Request submitted' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}