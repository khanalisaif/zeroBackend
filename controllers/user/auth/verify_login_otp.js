import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import crypto from 'crypto';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function verifyLoginOtp(req, res) {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(422).json({ success: false, message: 'Validation failed' });
        const user = await User.findOne({ $or: [{ phone }, { number: phone }] });
        if (!user) return res.status(404).json({ success: false, message: 'User not found. Use verify-registration if new account.' });
        
        const otpRecord = await Otp.findOne({ phone, otp });
        if (!otpRecord || otpRecord.expires_at < new Date()) return res.status(422).json({ success: false, message: 'Validation failed', errors: { otp: "Invalid or expired OTP" }});
        
        await Otp.deleteMany({ phone });
        user.access_token = crypto.randomBytes(32).toString('hex');
        user.access_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.refresh_token = crypto.randomBytes(64).toString('hex');
        user.refresh_token_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.last_login_at = new Date();
        await user.save();
        
        if (user.email) {
            await sendTemplateMail(user.email, 'user_login_alert', {});
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Login successful.', 
            data: { 
                token: user.access_token, 
                access_token: user.access_token,
                user: { 
                    id: user._id, 
                    full_name: user.full_name || user.name, 
                    phone: user.phone || user.number,
                    pan: user.pan || user.pan_number,
                    avatar_url: user.avatar_url || user.profile_pic || null,
                    delete_account_status: user.delete_account_status || false
                } 
            } 
        });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
}