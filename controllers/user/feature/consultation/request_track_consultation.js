import { Consultation } from '../../../../models/Consultation.js';
import { Otp } from '../../../../models/Otp.js';
import { sendTemplateMail } from '../../../../services/email/mail_helper.js';

function maskEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    let maskedName = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '*'.repeat(Math.max(name.length - 2, 0));
    return maskedName + '@' + domain;
}

export async function requestTrackConsultation(req, res) {
    try {
        let email = (req.body.email || req.query.email || '').trim();
        const ticket_id = (req.body.ticket_id || req.body.ticketId || req.query.ticket_id || '').trim();

        if (!email && !ticket_id) {
            return res.json({ status: false, message: 'email or ticket_id is required' });
        }

        if (ticket_id && !email) {
            const ticket = await Consultation.findOne({ ticket_id }).lean();
            if (!ticket) {
                return res.json({ status: false, message: 'Invalid Consultation Ticket ID' });
            }
            email = (ticket.email || '').trim();
            if (!email) {
                return res.json({ status: false, message: 'No registered email address found for this ticket. Please contact support.' });
            }
        } else if (email) {
            const exists = await Consultation.findOne({
                email: { $regex: new RegExp('^' + email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
            }).lean();
            if (!exists) {
                return res.json({ status: false, message: 'No consultation tickets found with this email address.' });
            }
        }

        const activeOtp = await Otp.findOne({ email, expires_at: { $gt: new Date() } }).lean();
        if (activeOtp) {
            return res.json({ status: false, message: 'OTP is already sent', email: maskEmail(email), actual_email: email });
        }

        await Otp.deleteMany({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);

        await Otp.create({ email, otp, expires_at: expiresAt });

        const mailRes = await sendTemplateMail(email, 'user_login_otp', { email, otp });
        if (mailRes && mailRes.status) {
            return res.json({ status: true, message: 'OTP sent successfully', email: maskEmail(email), actual_email: email });
        } else {
            return res.json({ status: false, message: 'Failed to send OTP email' });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
