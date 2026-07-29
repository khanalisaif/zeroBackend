import { Admin } from '../../../models/Admin.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function masterAdminLogin(req, res) {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const password = (req.body.password || '').trim();

        if (!email || !password) {
            return res.json({ status: false, message: 'Email and password are required' });
        }

        const allowedEmails = (process.env.MASTER_ADMIN_EMAILS || 'mustafahasan555@gmail.com,hasansaifkhan0@gmail.com')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (!allowedEmails.includes(email)) {
            return res.json({
                status: false,
                message: 'Access Denied: This email is not authorized for Master Admin access.'
            });
        }

        let admin = await Admin.findOne({ email });

        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const accessExpiry = new Date(Date.now() + 86400000);
        const refreshExpiry = new Date(Date.now() + 30 * 86400000);

        if (!admin) {
            // Auto-create master admin if not in DB yet
            const hashedPassword = await bcrypt.hash(password, 10);
            admin = await Admin.create({
                name: 'Master Admin',
                email: email,
                password: hashedPassword,
                role: 'master_admin',
                access_token: accessToken,
                refresh_token: refreshToken,
                access_token_expires_at: accessExpiry,
                refresh_token_expires_at: refreshExpiry,
                last_login_at: new Date()
            });
        } else {
            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (!passwordMatch) {
                return res.json({ status: false, message: 'Invalid Master Admin password' });
            }

            admin.role = 'master_admin';
            admin.access_token = accessToken;
            admin.refresh_token = refreshToken;
            admin.access_token_expires_at = accessExpiry;
            admin.refresh_token_expires_at = refreshExpiry;
            admin.last_login_at = new Date();
            await admin.save();
        }

        return res.json({
            status: true,
            message: 'Master Admin login successful',
            data: {
                id: admin._id,
                name: admin.name || 'Master Admin',
                email: admin.email,
                role: 'master_admin',
                access_token: accessToken,
                refresh_token: refreshToken,
                access_token_expires_at: accessExpiry.toISOString(),
                refresh_token_expires_at: refreshExpiry.toISOString()
            }
        });
    } catch (err) {
        console.error('masterAdminLogin Error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
