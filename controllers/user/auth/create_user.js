import { createUser as _createUser } from '../../../models/userFunctions.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function createUser(req, res) {
    const number = (req.body.number || '').trim();
    const email = (req.body.email || '').trim();
    const name = (req.body.name || '').trim();
    const password = (req.body.password || '').trim();

    try {
        const response = await _createUser(number, email, name, password);
        if (!response.status || !response.is_new_user) {
            return res.status(400).json(response);
        }
        if (response.is_new_user) {
            sendTemplateMail(email, 'welcome_user', { email }).catch(() => {});
        }
        return res.json(response);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || '';
            const msg = field === 'email'
                ? 'This email address is already registered. Please log in or use a different email.'
                : 'This mobile number is already registered. Please log in or use a different number.';
            return res.status(400).json({ status: false, is_new_user: false, message: msg });
        }
        return res.status(500).json({ status: false, message: err.message });
    }
}