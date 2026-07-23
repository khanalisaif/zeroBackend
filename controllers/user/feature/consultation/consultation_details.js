import { Consultation } from '../../../../models/Consultation.js';
import mongoose from 'mongoose';

export async function getConsultationDetails(req, res) {
    try {
        const id = (req.body.id || req.query.id || req.body.ticket_id || req.query.ticket_id || '').trim();
        const user_id = req.user ? req.user._id : (req.body.user_id || req.query.user_id);

        if (!id) return res.json({ status: false, message: 'ID or ticket_id required' });

        let query = { user_id };
        if (mongoose.Types.ObjectId.isValid(id)) {
            query.$or = [{ _id: id }, { ticket_id: id }];
        } else {
            query.ticket_id = id;
        }

        const data = await Consultation.findOne(query).lean();
        if (!data) return res.json({ status: false, message: 'Not found' });
        
        return res.json({ status: true, data });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}