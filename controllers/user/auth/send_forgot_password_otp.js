import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

function maskEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    let maskedName = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '*'.repeat(Math.max(name.length - 2, 0));
    return maskedName + '@' + domain;
}

export async function sendForgotPasswordOtp(req, res) {
    try {
        const email = (req.body.email || '').trim();
        if (!email) {
            return res.json({ status: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.json({ status: false, message: 'User not found.' });
        }

        await Otp.deleteMany({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);

        await Otp.create({
            email,
            otp,
            expires_at: expiresAt
        });

        const mailRes = await sendTemplateMail(email, 'forgot_password_otp', { name: user.name || 'Customer', email, otp });
        if (mailRes && mailRes.status) {
            return res.json({ status: true, message: `OTP sent successfully on ${maskEmail(email)}` });
        } else {
            return res.json({ status: false, message: 'Failed to send OTP email' });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}