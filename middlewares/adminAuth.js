import { Admin } from '../models/Admin.js';

export async function adminAuth(req, res, next) {
    try {
        // 1. Check for X-Admin-Key header (as specified in API_DOCUMENTATION.md Section 1.1 & Module 12)
        const adminKey = req.headers['x-admin-key'] || req.headers['x-api-key'];
        const configuredKey = process.env.ADMIN_API_KEY || 'zc_admin_secret_key_2026';

        if (adminKey && adminKey === configuredKey) {
            req.admin = {
                _id: 'master_system_admin',
                name: 'Master Admin',
                email: 'admin@zerocommission.finance',
                role: 'master'
            };
            return next();
        }

        // 2. Check for Bearer token
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access. Valid Bearer token or X-Admin-Key required.'
            });
        }

        token = token.replace('Bearer ', '').trim();
        const admin = await Admin.findOne({ access_token: token }).lean();
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access. Valid Bearer token required.'
            });
        }

        if (admin.access_token_expires_at && new Date() > new Date(admin.access_token_expires_at)) {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        req.admin = admin;
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Auth middleware error',
            error: err.message
        });
    }
}