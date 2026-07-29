import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { createUser } from '../../../models/userFunctions.js';

export async function sendLoginOtp(req, res) {
    try {
        const email = (req.body.email || '').trim();
        const mobile = (req.body.number || '').trim();
        
        await createUser(mobile, email);

        await Otp.deleteMany({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);

        await Otp.create({ email, otp, expires_at: expiresAt });

        const mailRes = await sendTemplateMail(email, 'user_login_otp', { otp });
        if (mailRes && mailRes.status) {
            return res.json({ status: true, message: 'OTP sent successfully' });
        } else {
            return res.json({ status: false, message: 'Failed to send OTP email' });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}