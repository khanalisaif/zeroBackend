import { User } from '../../../models/User.js';

export async function updateProfile(req, res) {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

        const name = (req.body.name || '').trim();
        const number = (req.body.number || '').trim();

        const updates = {};
        if (name) updates.name = name;
        if (number) updates.number = number;

        await User.updateOne({ _id: user._id }, { $set: updates });
        const updatedUser = await User.findById(user._id).lean();

        return res.json({
            status: true,
            message: 'Profile updated successfully',
            data: {
                id: updatedUser._id,
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                number: updatedUser.number || '',
                profile_pic: updatedUser.profile_pic || ''
            }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
