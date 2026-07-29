import { User } from '../../../models/User.js';

export async function updateProfile(req, res) {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

        const first_name = (req.body.first_name || '').trim();
        const last_name = (req.body.last_name || '').trim();

        if (!first_name) {
            return res.status(400).json({ status: false, message: 'First name is required.' });
        }

        const fullName = [first_name, last_name].filter(Boolean).join(' ');

        const updates = {
            first_name,
            last_name,
            name: fullName
        };

        await User.updateOne({ _id: user._id }, { $set: updates });
        const updatedUser = await User.findById(user._id).lean();

        return res.json({
            status: true,
            message: 'Profile updated successfully',
            data: {
                id: updatedUser._id,
                first_name: updatedUser.first_name || '',
                last_name: updatedUser.last_name || '',
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                number: updatedUser.number || '',
                pan_number: updatedUser.pan_number || '',
                profile_pic: updatedUser.profile_pic || ''
            }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}

