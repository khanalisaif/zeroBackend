import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import { PendingRegistration } from '../../../models/PendingRegistration.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function sendLoginOtp(req, res) {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(422).json({ success: false, message: 'Validation failed', errors: { phone: "Phone required" }});
        const user = await User.findOne({ $or: [{ phone }, { number: phone }] });
        
        let targetEmail = null;
        if (user && user.email) targetEmail = user.email;

        if (!user) {
            const pending = await PendingRegistration.findOne({ phone });
            if (pending) {
                pending.otp = Math.floor(1000 + Math.random() * 9000).toString();
                pending.expires_at = new Date(Date.now() + 5*60000);
                await pending.save();
                if (pending.email) await sendTemplateMail(pending.email, 'user_login_otp', { otp: pending.otp });
                return res.status(200).json({ success: true, message: 'OTP sent successfully.', data: { phone, expires_in: 300, sms_sent: true } });
            }
            return res.status(404).json({ success: false, message: 'Account not found.' });
        }
        
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await Otp.deleteMany({ phone });
        const otpRecord = new Otp({ phone, email: targetEmail, otp, expires_at: new Date(Date.now() + 5*60000) });
        await otpRecord.save();
        
        if (targetEmail) {
            await sendTemplateMail(targetEmail, 'user_login_otp', { otp });
        }
        
        return res.status(200).json({ success: true, message: 'OTP sent successfully.', data: { phone, expires_in: 300, sms_sent: true } });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
}