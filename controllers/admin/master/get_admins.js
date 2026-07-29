import { Admin } from '../../../models/Admin.js';

export async function getAdminsList(req, res) {
    try {
        const admins = await Admin.find({}).sort({ created_at: -1 }).lean();

        return res.json({
            status: true,
            message: 'Admins fetched successfully',
            data: admins.map(a => ({
                id: a._id,
                name: a.name || 'Admin',
                email: a.email || '',
                number: a.number || '',
                role: a.role || 'admin',
                permissions: a.permissions || [],
                created_at: a.created_at || null,
                last_login_at: a.last_login_at || null
            }))
        });
    } catch (err) {
        console.error('getAdminsList error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
