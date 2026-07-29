import { MasterAdmin } from '../../../models/MasterAdmin.js';
import { Otp } from '../../../models/Otp.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function masterSendOtp(req, res) {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        if (!email) {
            return res.json({ status: false, message: 'Email is required' });
        }

        const allowedEmails = (process.env.MASTER_ADMIN_EMAILS || 'mustafahasan555@gmail.com,hasansaifkhan0@gmail.com')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (!allowedEmails.includes(email)) {
            return res.json({
                status: false,
                message: 'Access Denied: Your email is not authorized for the Master Admin Portal.'
            });
        }

        let masterAdmin = await MasterAdmin.findOne({ email });
        if (!masterAdmin) {
            masterAdmin = await MasterAdmin.create({
                name: 'Master Admin',
                email: email
            });
        }

        await Otp.deleteMany({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);

        await Otp.create({
            email,
            otp,
            expires_at: expiresAt
        });

        console.log(`[MASTER ADMIN LOGIN] OTP for ${email}: ${otp}`);

        const mailRes = await sendTemplateMail(email, 'master_admin_login_otp', { otp });
        if (mailRes && mailRes.status) {
            return res.json({ status: true, message: 'OTP sent successfully to your registered email' });
        } else {
            return res.json({ status: true, message: 'OTP sent to your authorized Master Admin email' });
        }
    } catch (err) {
        console.error('masterSendOtp error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
