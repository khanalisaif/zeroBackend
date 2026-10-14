import { User } from '../../../models/User.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function userLogout(req, res) {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).lean();
        if (user) {
            await User.updateOne({ _id: userId }, {
                access_token: null,
                refresh_token: null,
                access_token_expires_at: null,
                refresh_token_expires_at: null
            });
            if (user.email) {
                sendTemplateMail(user.email, 'user_logout_notification', { name: user.name }).catch(() => {});
            }
        }

        return res.status(200).json({ success: true, message: 'Logout successful.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}