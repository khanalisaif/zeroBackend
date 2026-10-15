import { Admin } from '../../../models/Admin.js';
import { Otp } from '../../../models/Otp.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { sendOtpSms } from '../../../services/sms/smsService.js';

export async function sendLoginOtp(req, res) {
    try {
        const email = (req.body.email || '').trim();
        const admin = await Admin.findOne({ email }).lean();
        if (!admin) {
            return res.json({ status: false, message: 'Invalid email' });
        }

        await Otp.deleteMany({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);

        await Otp.create({
            email,
            otp,
            expires_at: expiresAt
        });

        const mailRes = await sendTemplateMail(email, 'admin_login_otp', { otp });

        // Send OTP via SMS to admin's registered mobile (PRP SMS — SignIn_OTP template)
        if (admin.number) {
            sendOtpSms(admin.number, otp, 'login')
                .catch(err => console.error('[Admin] Login OTP SMS failed:', err));
        }

        if (mailRes && mailRes.status) {
            return res.json({ status: true, message: 'OTP sent successfully' });
        } else {
            return res.json({ status: false, message: 'Failed to send OTP email' });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}