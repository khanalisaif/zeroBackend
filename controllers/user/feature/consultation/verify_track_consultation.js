import { Consultation } from '../../../../models/Consultation.js';
import { Otp } from '../../../../models/Otp.js';

export async function verifyTrackConsultation(req, res) {
    try {
        let email = (req.body.email || req.query.email || '').trim();
        const ticket_id = (req.body.ticket_id || req.body.ticketId || '').trim();
        const otp = (req.body.otp || '').trim();

        if ((!ticket_id && !email) || !otp) {
            return res.json({ status: false, message: 'email/ticket_id and otp are required' });
        }

        let ticket = null;
        if (ticket_id && !email) {
            ticket = await Consultation.findOne({ ticket_id }).lean();
            if (!ticket) {
                return res.json({ status: false, message: 'Invalid Consultation Ticket ID' });
            }
            email = (ticket.email || '').trim();
            if (!email) {
                return res.json({ status: false, message: 'No registered email address found for this ticket.' });
            }
        }

        const validOtp = await Otp.findOne({ email, otp, expires_at: { $gt: new Date() } });
        if (!validOtp) {
            return res.json({ status: false, message: 'Invalid or expired OTP' });
        }

        await Otp.deleteMany({ email });

        return res.json({ status: true, message: 'OTP verified successfully', data: ticket, email });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
