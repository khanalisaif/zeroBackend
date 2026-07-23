import { User } from '../models/User.js';
export async function userAuth(req, res, next) {
    try {
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ status: false, message: 'Unauthorized: No token provided' });
        token = token.replace('Bearer ', '').trim();
        const user = await User.findOne({ access_token: token }).lean();
        if (!user) return res.status(401).json({ status: false, message: 'Unauthorized: Invalid token' });
        if (user.access_token_expires_at && new Date() > new Date(user.access_token_expires_at)) {
            return res.status(401).json({ status: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Auth middleware error', error: err.message });
    }
}