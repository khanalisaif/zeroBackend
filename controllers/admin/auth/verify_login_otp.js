import { Admin } from '../../../models/Admin.js';
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

        const admin = await Admin.findOne({ email }).lean();
        if (!admin) {
            return res.json({ status: false, message: 'Admin not found' });
        }

        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(64).toString('hex');

        const accessExpiry = new Date(Date.now() + 86400000);
        const refreshExpiry = new Date(Date.now() + 30 * 86400000);

        await Admin.updateOne({ _id: admin._id }, {
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_at: accessExpiry,
            refresh_token_expires_at: refreshExpiry
        });

        return res.json({
            status: true,
            message: 'Login successful',
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
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