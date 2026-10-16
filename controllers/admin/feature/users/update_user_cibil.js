import { CibilScore } from '../../../../models/CibilScore.js';
import { User } from '../../../../models/User.js';

export async function updateUserCibil(req, res) {
    try {
        const userId = req.body.user_id || req.body.id || req.query.user_id || req.query.id;
        const rawScore = req.body.cibil_score !== undefined ? req.body.cibil_score : req.body.score;
        const { rating, rating_description, change_delta } = req.body;

        if (!userId || rawScore === undefined || rawScore === null || rawScore === '') {
            return res.status(400).json({ status: false, success: false, message: 'user_id and cibil_score (or score) are required.' });
        }

        const score = Number(rawScore);
        if (isNaN(score)) {
            return res.status(400).json({ status: false, success: false, message: 'cibil_score must be a valid number.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, success: false, message: 'User not found.' });
        }

        const calculatedRating = rating || (score >= 750 ? 'Good' : score >= 700 ? 'Fair' : 'Poor');
        const cibil = await CibilScore.findOneAndUpdate(
            { user_id: user._id },
            {
                user_id: user._id,
                score,
                rating: calculatedRating,
                rating_description: rating_description || (score >= 750 ? 'Your credit profile is good.' : 'Your credit score needs improvement.'),
                change_delta: change_delta || '+0',
                last_updated: new Date()
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            status: true,
            success: true,
            message: 'User CIBIL score updated successfully.',
            data: {
                id: cibil._id,
                user_id: cibil.user_id,
                score: cibil.score,
                cibil_score: cibil.score,
                rating: cibil.rating,
                rating_description: cibil.rating_description,
                change_delta: cibil.change_delta,
                last_updated: cibil.last_updated
            }
        });
    } catch (err) {
        return res.status(500).json({ status: false, success: false, message: err.message });
    }
}
