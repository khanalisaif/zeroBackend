import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import bcrypt from 'bcrypt';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function verifyForgotPasswordOtp(req, res) {
    try {
        const email = (req.body.email || '').trim();
        const otpInput = (req.body.otp || '').trim();
        const new_password = (req.body.new_password || '').trim();

        if (!email || !otpInput || !new_password) {
            return res.json({ status: false, message: 'Email, OTP and new password are required.' });
        }

        await Otp.deleteMany({ expires_at: { $lte: new Date() } });

        const otpRecord = await Otp.findOne({ email }).sort({ _id: -1 }).lean();
        if (!otpRecord) {
            return res.json({ status: false, message: 'Invalid or expired OTP.' });
        }

        if (otpRecord.attempt_count >= 3) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.json({ status: false, message: 'Maximum attempts reached' });
        }

        if (otpRecord.otp !== otpInput) {
            await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempt_count: 1 } });
            return res.json({ status: false, message: 'Invalid OTP.' });
        }

        // Hash new password and update user; also clear tokens (same as PHP)
        const passwordHash = await bcrypt.hash(new_password, 10);

        await User.updateOne({ email }, {
            password: passwordHash,
            access_token: null,
            refresh_token: null,
            access_token_expires_at: null,
            refresh_token_expires_at: null
        });

        // Delete all OTPs for this email
        await Otp.deleteMany({ email });

        // Fetch user name for email
        const user = await User.findOne({ email }, { name: 1 }).lean();

        // Send password changed notification (same as PHP)
        sendTemplateMail(email, 'user_password_changed', {
            name: user ? user.name : 'Customer'
        }).catch(() => {});

        return res.json({ status: true, message: 'Password reset successfully.' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}