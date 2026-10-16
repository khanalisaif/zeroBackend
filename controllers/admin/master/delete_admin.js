import { Admin } from '../../../models/Admin.js';
import mongoose from 'mongoose';

export async function deleteAdminAccount(req, res) {
    try {
        const id = (req.body.adminId || req.body.admin_id || req.body.id || req.query.adminId || req.query.admin_id || req.query.id || '').trim();
        if (!id) {
            return res.status(400).json({ status: false, success: false, message: 'Admin ID is required' });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ status: false, success: false, message: 'Invalid Admin ID format' });
        }

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ status: false, success: false, message: 'Admin account not found' });
        }

        await Admin.findByIdAndDelete(id);

        return res.json({
            status: true,
            success: true,
            message: 'Admin account deleted successfully'
        });
    } catch (err) {
        console.error('deleteAdminAccount error:', err);
        return res.status(500).json({ status: false, success: false, message: 'Server error', error: err.message });
    }
}
