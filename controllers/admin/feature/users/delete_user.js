import mongoose from 'mongoose';
import { User } from '../../../../models/User.js';

export async function deleteUser(req, res) {
    try {
        const id = (req.body.user_id || req.body.id || req.query.user_id || req.query.id || '').trim();
        if (!id) {
            return res.status(400).json({ status: false, success: false, message: 'User ID is required' });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ status: false, success: false, message: 'Invalid User ID format' });
        }

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ status: false, success: false, message: 'User not found' });
        }

        return res.json({
            status: true,
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('deleteUser error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
