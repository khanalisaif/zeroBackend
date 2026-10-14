import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import crypto from 'crypto';

export async function verifyForgotPasswordOtp(req, res) {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(422).json({ success: false, message: 'Validation failed' });
        const otpRecord = await Otp.findOne({ phone, otp });
        if (!otpRecord) return res.status(422).json({ success: false, message: 'Validation failed', errors: { otp: "Invalid OTP" }});
        if (otpRecord.expires_at < new Date()) return res.status(422).json({ success: false, message: 'Validation failed', errors: { otp: "OTP expired" }});
        
        const user = await User.findOne({ $or: [{ phone }, { number: phone }] });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        await Otp.deleteMany({ phone });
        const verify_token = crypto.randomBytes(32).toString('hex');
        user.refresh_token = verify_token;
        user.refresh_token_expires_at = new Date(Date.now() + 10*60000);
        await user.save();
        
        return res.status(200).json({ success: true, message: 'OTP verified successfully.', data: { user_id: user._id, verify_token, expires_in: 600, forgot_password: true } });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
}