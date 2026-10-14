import { User } from '../../../models/User.js';
import bcrypt from 'bcrypt';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function setPassword(req, res) {
    try {
        const { user_id, verify_token, password } = req.body;
        if (!user_id || !verify_token || !password) return res.status(422).json({ success: false, message: 'Validation failed' });
        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (user.refresh_token !== verify_token || user.refresh_token_expires_at < new Date()) {
            return res.status(422).json({ success: false, message: 'Validation failed', errors: { verify_token: "Invalid or expired token" } });
        }
        
        user.password = await bcrypt.hash(password, 10);
        user.refresh_token = null;
        user.refresh_token_expires_at = null;
        await user.save();

        if (user.email) {
            await sendTemplateMail(user.email, 'user_password_changed', { name: user.full_name || user.name });
        }
        
        return res.status(200).json({ success: true, message: 'Password updated successfully. Please login with your new password.', data: null });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
}