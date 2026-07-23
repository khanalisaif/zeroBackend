import { Admin } from '../../../models/Admin.js';

export async function adminLogout(req, res) {
    try {
        const adminId = req.admin ? req.admin._id : (req.body.admin_id || '');
        if (!adminId) {
            return res.json({ status: false, message: 'Admin ID required' });
        }
        await Admin.updateOne({ _id: adminId }, { 
            access_token: null, 
            refresh_token: null,
            access_token_expires_at: null,
            refresh_token_expires_at: null
        });
        return res.json({ status: true, message: 'Logged out successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}