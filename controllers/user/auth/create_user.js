import { createUser as _createUser } from '../../../models/userFunctions.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function createUser(req, res) {
    const number = (req.body.number || '').trim();
    const email = (req.body.email || '').trim();

    try {
        const response = await _createUser(number, email);
        if (response.is_new_user) {
            sendTemplateMail(email, 'welcome_user', { email }).catch(() => {});
        }
        return res.json(response);
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}