import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { sendOtpSms } from '../../../services/sms/smsService.js';

export async function sendForgotPasswordOtp(req, res) {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(422).json({ success: false, message: 'Validation failed', errors: { phone: "Phone required" }});
        const user = await User.findOne({ $or: [{ phone }, { number: phone }] });
        if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
        
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await Otp.deleteMany({ phone });
        const otpRecord = new Otp({ phone, email: user.email, otp, expires_at: new Date(Date.now() + 5*60000) });
        await otpRecord.save();

        if (user.email) {
            await sendTemplateMail(user.email, 'forgot_password_otp', { otp });
        }

        // Send OTP via SMS (PRP SMS — Reset_Password_OTP template)
        sendOtpSms(phone, otp, 'forgotPassword')
            .catch(err => console.error('Forgot Password OTP SMS failed:', err));

        return res.status(200).json({ success: true, message: 'OTP sent successfully.', data: { phone, expires_in: 300, sms_sent: true } });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
}