import { Admin } from '../models/Admin.js';
export async function adminAuth(req, res, next) {
    try {
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ status: false, message: 'Unauthorized: No token provided' });
        token = token.replace('Bearer ', '').trim();
        const admin = await Admin.findOne({ access_token: token }).lean();
        if (!admin) return res.status(401).json({ status: false, message: 'Unauthorized: Invalid token' });
        if (admin.access_token_expires_at && new Date() > new Date(admin.access_token_expires_at)) {
            return res.status(401).json({ status: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        req.admin = admin;
        next();
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Auth middleware error', error: err.message });
    }
}