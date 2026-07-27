import { LoanApplication } from '../../../models/LoanApplication.js';
import { Otp } from '../../../models/Otp.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

function maskEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    let maskedName = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '*'.repeat(Math.max(name.length - 2, 0));
    return maskedName + '@' + domain;
}

export async function requestTrackApplication(req, res) {
    try {
        let email = (req.body.email || '').trim();
        const applicationToken = (req.body.application_token || req.body.applicationToken || '').trim();

        if (!email && !applicationToken) {
            return res.json({ status: false, message: 'Email or application_token is required' });
        }

        if (applicationToken && !email) {
            const app = await LoanApplication.findOne({ application_token: applicationToken }).lean();
            if (!app) return res.json({ status: false, message: 'Invalid application token' });
            email = (app.email || '').trim();
        }

        if (!email) {
            return res.json({ status: false, message: 'Email not found' });
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