import { CibilScore } from '../../../../models/CibilScore.js';
import { User } from '../../../../models/User.js';

export async function updateUserCibil(req, res) {
    try {
        const { user_id, score, rating, rating_description, change_delta } = req.body;
        if (!user_id || !score) {
            return res.status(400).json({ success: false, message: 'user_id and score are required.' });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const calculatedRating = rating || (score >= 750 ? 'Good' : score >= 700 ? 'Fair' : 'Poor');
        const cibil = await CibilScore.findOneAndUpdate(
            { user_id },
            {
                user_id,
                score,
                rating: calculatedRating,
                rating_description: rating_description || 'Updated by Administrator.',
                change_delta: change_delta || '+0',
                last_updated: new Date()
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'User CIBIL score updated successfully.',
            data: cibil
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
