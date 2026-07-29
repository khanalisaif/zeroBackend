import { User } from '../../../../models/User.js';

export async function deleteUser(req, res) {
    try {
        const id = req.body.id || req.query.id || '';
        if (!id) {
            return res.status(400).json({ status: false, message: 'User ID is required' });
        }

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        return res.json({
            status: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('deleteUser error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
