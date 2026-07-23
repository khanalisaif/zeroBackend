import { User } from '../../../models/User.js';
import bcrypt from 'bcrypt';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function setPassword(req, res) {
    try {
        const oldPassword = (req.body.old_password || '').trim();
        const newPassword = (req.body.new_password || '').trim();
        const userId = req.user._id; // User must be authenticated

        if (!newPassword) {
            return res.json({ status: false, message: 'New password is required.' });
        }

        if (newPassword.length < 6) {
            return res.json({ status: false, message: 'Password must be at least 6 characters.' });
        }

        const user = await User.findById(userId).lean();
        if (!user) {
            return res.json({ status: false, message: 'User not found.' });
        }

        if (user.password) {
            if (!oldPassword) {
                return res.json({ status: false, message: 'Old password is required.' });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.json({ status: false, message: 'Old password is incorrect.' });
            }
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ _id: userId }, { password: passwordHash });

        const isNewPassword = !user.password;
        
        sendTemplateMail(user.email, 'user_password_changed', { name: user.name || 'Customer' }).catch(() => {});

        return res.json({ 
            status: true, 
            message: isNewPassword ? 'Password created successfully.' : 'Password updated successfully.' 
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}