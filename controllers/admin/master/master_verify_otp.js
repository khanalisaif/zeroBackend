import { MasterAdmin } from '../../../models/MasterAdmin.js';
import { Otp } from '../../../models/Otp.js';
import crypto from 'crypto';

export async function masterVerifyOtp(req, res) {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const otpInput = (req.body.otp || '').trim();

        if (!email || !otpInput) {
            return res.json({ status: false, message: 'Email and OTP are required' });
        }

        const allowedEmails = (process.env.MASTER_ADMIN_EMAILS || 'mustafahasan555@gmail.com,hasansaifkhan0@gmail.com')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (!allowedEmails.includes(email)) {
            return res.json({
                status: false,
                message: 'Access Denied: This email is not authorized for the Master Admin Portal.'
            });
        }

        await Otp.deleteMany({ expires_at: { $lte: new Date() } });

        const otpRecord = await Otp.findOne({ email }).sort({ _id: -1 }).lean();
        if (!otpRecord) {
            return res.json({ status: false, message: 'OTP expired or invalid. Please request a new OTP.' });
        }

        if (otpRecord.attempt_count >= 3) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.json({ status: false, message: 'Maximum attempts reached. Please request a new OTP.' });
        }

        if (otpRecord.otp !== otpInput) {
            await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempt_count: 1 } });
            return res.json({ status: false, message: 'Incorrect OTP' });
        }

        await Otp.deleteOne({ _id: otpRecord._id });

        let masterAdmin = await MasterAdmin.findOne({ email });
        if (!masterAdmin) {
            masterAdmin = await MasterAdmin.create({
                name: 'Master Admin',
                email: email
            });
        }

        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(64).toString('hex');

        const accessExpiry = new Date(Date.now() + 86400000);
        const refreshExpiry = new Date(Date.now() + 30 * 86400000);

        masterAdmin.access_token = accessToken;
        masterAdmin.refresh_token = refreshToken;
        masterAdmin.access_token_expires_at = accessExpiry;
        masterAdmin.refresh_token_expires_at = refreshExpiry;
        masterAdmin.last_login_at = new Date();
        await masterAdmin.save();

        return res.json({
            status: true,
            message: 'Master Admin login successful',
            data: {
                id: masterAdmin._id,
                name: masterAdmin.name || 'Master Admin',
                email: masterAdmin.email,
                role: 'master_admin',
                access_token: accessToken,
                refresh_token: refreshToken,
                access_token_expires_at: accessExpiry.toISOString(),
                refresh_token_expires_at: refreshExpiry.toISOString()
            }
        });
    } catch (err) {
        console.error('masterVerifyOtp error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
