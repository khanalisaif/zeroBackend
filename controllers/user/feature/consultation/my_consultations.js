import { Consultation } from '../../../../models/Consultation.js';

export async function getMyConsultations(req, res) {
    try {
        const user_id = req.user ? req.user._id : (req.body.user_id || req.query.user_id);
        const page = parseInt(req.body.page || req.query.page) || 1;
        const limit = parseInt(req.body.limit || req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!user_id) return res.json({ status: false, message: 'User ID required' });

        const total = await Consultation.countDocuments({ user_id });
        const data = await Consultation.find({ user_id }).sort({ _id: -1 }).skip(skip).limit(limit).lean();

        return res.json({
            status: true,
            data,
            pagination: { current_page: page, per_page: limit, total_records: total, total_pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}