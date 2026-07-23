import { Consultation } from '../../../../models/Consultation.js';
import { sendTemplateMail } from '../../../../services/email/mail_helper.js';

export async function createTicket(req, res) {
    try {
        const user_id = req.user ? req.user._id : req.body.user_id;
        const customer_name = req.user ? req.user.name : (req.body.customer_name || '').trim();
        const phone_number = req.user ? req.user.number : (req.body.phone_number || '').trim();
        const email = req.user ? req.user.email : (req.body.email || '').trim();
        const subject = (req.body.subject || '').trim();
        const issue = (req.body.issue || '').trim();

        if (!issue) return res.json({ status: false, message: 'Issue is required.' });

        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const prefix = `ZCCNSLT${dateStr}`;
        const count = await Consultation.countDocuments({ ticket_id: new RegExp('^' + prefix) });
        const ticket_id = prefix + (count + 1).toString().padStart(6, '0');

        await Consultation.create({ ticket_id, user_id, customer_name, phone_number, email, subject, issue });
        sendTemplateMail(email, 'consultation_ticket_created', { ticket_id }).catch(() => {});

        return res.json({ status: true, message: 'Support ticket created successfully.', ticket_id });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}