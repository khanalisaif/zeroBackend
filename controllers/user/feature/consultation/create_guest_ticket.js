import { Consultation } from '../../../../models/Consultation.js';
import { sendTemplateMail } from '../../../../services/email/mail_helper.js';
export async function createGuestTicket(req, res) {
    try {
        const { customer_name, phone_number, email = '', subject, issue } = req.body;
        if (!customer_name || !phone_number || !subject || !issue) return res.json({ status: false, message: 'Missing fields' });
        const prefix = 'TKT' + new Date().toISOString().slice(2,10).replace(/-/g, '');
        const count = await Consultation.countDocuments({ ticket_id: new RegExp('^' + prefix) });
        const ticket_id = prefix + (count + 1).toString().padStart(4, '0');
        await Consultation.create({ ticket_id, customer_name, phone_number, email, subject, issue });
        if (email) {
            sendTemplateMail(email, 'consultation_ticket_created', { ticket_id }).catch(() => {});
        }
        return res.json({ status: true, message: 'Ticket created', ticket_id });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}