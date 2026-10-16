import { User } from '../../../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function loginWithPassword(req, res) {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) return res.status(422).json({ success: false, message: "Validation failed" });
        const user = await User.findOne({ $or: [{ phone }, { number: phone }] });
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid password." });
        
        user.access_token = crypto.randomBytes(32).toString('hex');
        user.access_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.refresh_token = crypto.randomBytes(64).toString('hex');
        user.refresh_token_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.last_login_at = new Date();
        await user.save();
        
        if (user.email) {
            await sendTemplateMail(user.email, 'user_login_alert', {});
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Login successful.', 
            data: { 
                token: user.access_token, 
                access_token: user.access_token,
                user: { 
                    id: user._id, 
                    name: user.full_name || user.name, 
                    full_name: user.full_name || user.name, 
                    phone: user.phone || user.number, 
                    pan: user.pan || user.pan_number,
                    delete_account_status: user.delete_account_status,
                    delete_account_days_left: user.delete_account_days_left
                } 
            } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
