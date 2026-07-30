import { createUser as _createUser } from '../../../models/userFunctions.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { User } from '../../../models/User.js';

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
        if (response.is_new_user && response.user_id) {
            const cleanEmail = email ? email.trim() : '';
            const cleanNumber = number ? number.trim() : '';
            const query = [];
            if (cleanEmail) query.push({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
            if (cleanNumber) query.push({ number: cleanNumber });
            if (query.length > 0) {
                const existingApps = await LoanApplication.find({ $or: query }).lean();
                if (existingApps.length > 0) {
                    const appIds = existingApps.map(a => a._id.toString());
                    await LoanApplication.updateMany({ $or: query }, { $set: { user_id: response.user_id } });
                    await User.updateOne({ _id: response.user_id }, { $set: { application_ids: JSON.stringify(appIds) } });
                    console.log(`Linked ${existingApps.length} existing loan application(s) to new user ${response.user_id}`);
                }
            }
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