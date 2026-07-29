import { Admin } from '../../../models/Admin.js';

export async function updateAdminPermissions(req, res) {
    try {
        const id = req.body.id || req.body.adminId || '';
        const permissions = req.body.permissions || [];

        if (!id) {
            return res.json({ status: false, message: 'Admin ID is required' });
        }

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.json({ status: false, message: 'Admin account not found' });
        }

        admin.permissions = Array.isArray(permissions) ? permissions : [];
        await admin.save();

        return res.json({
            status: true,
            message: 'Admin portal permissions updated successfully!',
            data: {
                id: admin._id,
                permissions: admin.permissions
            }
        });
    } catch (err) {
        console.error('updateAdminPermissions error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
