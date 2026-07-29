export async function getAdminProfile(req, res) {
    try {
        const admin = req.admin;
        return res.json({
            status: true,
            message: 'Profile fetched successfully',
            data: {
                id: admin._id,
                name: admin.name || 'Admin',
                email: admin.email || '',
                number: admin.number || '',
                role: admin.role || 'admin',
                permissions: admin.permissions || []
            }
        });
    } catch (err) {
        console.error('getAdminProfile error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
