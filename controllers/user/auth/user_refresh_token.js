import { User } from '../../../models/User.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

export async function userRefreshToken(req, res) {
    try {
        const userId = req.body?.user_id || req.body?.id || req.body?.userId;
        const refreshToken = req.body?.refresh_token || req.headers['refresh-token'] || req.headers['Refresh-Token'] || '';

        let user = null;

        // 1. If user_id is passed in the request body
        if (userId) {
            const cleanId = String(userId).trim();
            if (mongoose.Types.ObjectId.isValid(cleanId)) {
                user = await User.findById(cleanId);
            }
            if (!user) {
                user = await User.findOne({
                    $or: [
                        { phone: cleanId },
                        { number: cleanId },
                        { email: cleanId }
                    ]
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    status: false,
                    message: 'User not found with the provided user_id.'
                });
            }
        }
        // 2. If refresh_token is provided in body or header
        else if (refreshToken) {
            user = await User.findOne({ refresh_token: String(refreshToken).trim() });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    status: false,
                    message: 'Invalid refresh token.'
                });
            }

            if (user.refresh_token_expires_at && new Date() > new Date(user.refresh_token_expires_at)) {
                return res.status(401).json({
                    success: false,
                    status: false,
                    message: 'Refresh token expired. Please login again.'
                });
            }
        }
        // 3. Fallback: Check Authorization bearer header if passed
        else if (req.headers.authorization) {
            const token = req.headers.authorization.replace('Bearer ', '').trim();
            if (token) {
                user = await User.findOne({ access_token: token });
            }
            if (!user) {
                return res.status(401).json({
                    success: false,
                    status: false,
                    message: 'Invalid token in Authorization header.'
                });
            }
        } else {
            return res.status(422).json({
                success: false,
                status: false,
                message: 'User ID (user_id) or refresh_token is required in request body.'
            });
        }

        // Generate brand new access and refresh tokens
        const newAccessToken = crypto.randomBytes(32).toString('hex');
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const accessExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);       // 24 hours
        const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 30 days

        user.access_token = newAccessToken;
        user.access_token_expires_at = accessExpiry;
        user.refresh_token = newRefreshToken;
        user.refresh_token_expires_at = refreshExpiry;
        await user.save();

        return res.status(200).json({
            success: true,
            status: true,
            message: 'Token refreshed successfully.',
            data: {
                token: newAccessToken,
                access_token: newAccessToken,
                access_token_expires_at: accessExpiry.toISOString(),
                user: {
                    id: user._id,
                    name: user.full_name || user.name || '',
                    full_name: user.full_name || user.name || '',
                    phone: user.phone || user.number || '',
                    email: user.email || ''
                }
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, status: false, message: err.message });
    }
}