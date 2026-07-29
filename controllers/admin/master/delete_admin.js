import { Admin } from '../../../models/Admin.js';

export async function deleteAdminAccount(req, res) {
    try {
        const id = req.body.id || req.query.id || '';
        if (!id) {
            return res.status(400).json({ status: false, message: 'Admin ID is required' });
        }

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ status: false, message: 'Admin account not found' });
        }

        await Admin.findByIdAndDelete(id);

        return res.json({

            status: true,
            message: 'Admin account deleted successfully'
        });
    } catch (err) {
        console.error('deleteAdminAccount error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
