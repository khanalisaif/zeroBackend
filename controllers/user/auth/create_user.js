import { createUser as _createUser } from '../../../models/userFunctions.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function createUser(req, res) {
    const number = (req.body.number || '').trim();
    const email = (req.body.email || '').trim();
    const first_name = (req.body.first_name || '').trim();
    const last_name = (req.body.last_name || '').trim();
    const pan_number = (req.body.pan_number || '').trim();
    const password = (req.body.password || '').trim();

    if (!first_name) {
        return res.status(400).json({ status: false, message: 'First name is required.' });
    }

    try {
        const response = await _createUser(number, email, first_name, last_name, pan_number, password);
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