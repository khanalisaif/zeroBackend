import { MasterAdmin } from '../models/MasterAdmin.js';
import { Admin } from '../models/Admin.js';

export async function masterAdminAuth(req, res, next) {
    try {
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ status: false, message: 'Unauthorized: No token provided' });
        token = token.replace('Bearer ', '').trim();

        let admin = await MasterAdmin.findOne({ access_token: token }).lean();
        if (!admin) {
            admin = await Admin.findOne({ access_token: token }).lean();
        }
        if (!admin) return res.status(401).json({ status: false, message: 'Unauthorized: Invalid token' });

        if (admin.access_token_expires_at && new Date() > new Date(admin.access_token_expires_at)) {
            return res.status(401).json({ status: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }

        const allowedEmails = (process.env.MASTER_ADMIN_EMAILS || 'mustafahasan555@gmail.com,hasansaifkhan0@gmail.com')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (!allowedEmails.includes((admin.email || '').toLowerCase())) {
            return res.status(403).json({
                status: false,
                message: 'Access Denied: Only authorized Master Admin accounts can perform this action.'
            });
        }

        req.admin = admin;
        next();
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Master Admin Auth middleware error', error: err.message });
    }
}
