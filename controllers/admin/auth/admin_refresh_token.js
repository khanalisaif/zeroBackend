import { Admin } from '../../../models/Admin.js';
import crypto from 'crypto';

export async function adminRefreshToken(req, res) {
    try {
        const refreshToken = req.body.refresh_token || '';
        if (!refreshToken) {
            return res.status(401).json({ status: false, message: 'Refresh token required' });
        }

        const admin = await Admin.findOne({ refresh_token: refreshToken });
        if (!admin) {
            return res.status(401).json({ status: false, message: 'Invalid refresh token' });
        }

        if (admin.refresh_token_expires_at && new Date() > new Date(admin.refresh_token_expires_at)) {
            return res.status(401).json({ status: false, message: 'Refresh token expired' });
        }

        const newAccessToken = crypto.randomBytes(32).toString('hex');
        const accessExpiry = new Date(Date.now() + 86400000); // 1 day

        await Admin.updateOne({ _id: admin._id }, {
            access_token: newAccessToken,
            access_token_expires_at: accessExpiry
        });

        return res.json({
            status: true,
            access_token: newAccessToken,
            access_token_expires_at: accessExpiry.toISOString()
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}