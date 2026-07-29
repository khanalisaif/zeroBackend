import { User } from '../../../models/User.js';
import { Otp } from '../../../models/Otp.js';
import crypto from 'crypto';

export async function verifyLoginOtp(req, res) {
    try {
        const email = (req.body.email || '').trim();
        const otpInput = (req.body.otp || '').trim();

        await Otp.deleteMany({ expires_at: { $lte: new Date() } });

        const otpRecord = await Otp.findOne({ email }).sort({ _id: -1 }).lean();
        if (!otpRecord) {
            return res.json({ status: false, message: 'OTP expired or invalid' });
        }

        if (otpRecord.attempt_count >= 3) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.json({ status: false, message: 'Maximum attempts reached' });
        }

        if (otpRecord.otp !== otpInput) {
            await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempt_count: 1 } });
            return res.json({ status: false, message: 'Incorrect OTP' });
        }

        await Otp.deleteOne({ _id: otpRecord._id });

        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(64).toString('hex');

        const accessExpiry = new Date(Date.now() + 86400000);
        const refreshExpiry = new Date(Date.now() + 30 * 86400000);

        await User.updateOne({ _id: user._id }, {
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_at: accessExpiry,
            refresh_token_expires_at: refreshExpiry,
            last_login_at: new Date()
        });

        return res.json({
            status: true,
            message: 'Login successful',
            data: {
                id: user._id,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                name: user.name || '',
                email: user.email,
                number: user.number || '',
                pan_number: user.pan_number || '',
                access_token: accessToken,
                refresh_token: refreshToken,
                access_token_expires_at: accessExpiry.toISOString(),
                refresh_token_expires_at: refreshExpiry.toISOString()
            }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
