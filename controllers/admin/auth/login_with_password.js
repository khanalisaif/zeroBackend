import { Admin } from '../../../models/Admin.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function loginWithPassword(req, res) {
    try {
        const email = (req.body.email || '').trim();
        const password = (req.body.password || '').trim();

        const admin = await Admin.findOne({ email }).lean();
        if (!admin) {
            return res.json({ status: false, message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.json({ status: false, message: 'Invalid credentials' });
        }

        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(64).toString('hex');

        const accessExpiry = new Date(Date.now() + 86400000);
        const refreshExpiry = new Date(Date.now() + 30 * 86400000);

        await Admin.updateOne({ _id: admin._id }, {
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_at: accessExpiry,
            refresh_token_expires_at: refreshExpiry
        });

        sendTemplateMail(email, 'admin_login_alert', { name: admin.name }).catch(() => {});

        return res.json({
            status: true,
            message: 'Login successful',
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
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