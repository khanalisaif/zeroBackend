import { User } from '../../../models/User.js';
import crypto from 'crypto';

export async function userRefreshToken(req, res) {
    try {
        const refreshToken = req.body.refresh_token || '';
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token required' });
        }

        const user = await User.findOne({ refresh_token: refreshToken });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        if (user.refresh_token_expires_at && new Date() > new Date(user.refresh_token_expires_at)) {
            return res.status(401).json({ success: false, message: 'Refresh token expired' });
        }

        const newAccessToken = crypto.randomBytes(32).toString('hex');
        const accessExpiry = new Date(Date.now() + 86400000);

        await User.updateOne({ _id: user._id }, {
            access_token: newAccessToken,
            access_token_expires_at: accessExpiry
        });

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.',
            data: {
                access_token: newAccessToken,
                access_token_expires_at: accessExpiry.toISOString()
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}