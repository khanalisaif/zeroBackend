import { User } from '../../../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function loginWithPassword(req, res) {
    try {
        const identifier = (req.body.identifier || '').trim();
        const password = (req.body.password || '').trim();

        if (!identifier || !password) {
            return res.json({ status: false, message: 'Identifier and password are required.' });
        }

        // Find user by email OR number (same as PHP)
        const user = await User.findOne({
            $or: [{ email: identifier }, { number: identifier }]
        }).lean();

        if (!user) {
            return res.json({ status: false, message: 'Account not found with this email or mobile number.' });
        }

        // Check account status
        if (user.account_status && user.account_status !== 'active') {
            return res.json({ status: false, message: 'Your account has been blocked. Please contact support.' });
        }

        // Check password set
        if (!user.password) {
            return res.json({ status: false, message: 'Password is not set. Please login using OTP or create a password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ status: false, message: 'Wrong password. Please try again.' });
        }

        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(64).toString('hex');

        const accessExpiry = new Date(Date.now() + 86400000);       // +1 day
        const refreshExpiry = new Date(Date.now() + 30 * 86400000); // +30 days

        await User.updateOne({ _id: user._id }, {
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_at: accessExpiry,
            refresh_token_expires_at: refreshExpiry,
            last_login_at: new Date()
        });

        // Fetch updated user
        const updatedUser = await User.findById(user._id).lean();

        sendTemplateMail(updatedUser.email, 'user_login_alert', { name: updatedUser.name }).catch(() => {});

        return res.json({
            status: true,
            message: 'Login successful.',
            data: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                number: updatedUser.number,
                profile_pic: updatedUser.profile_pic || null,
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