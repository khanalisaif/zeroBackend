import { Consultation } from '../../../../models/Consultation.js';
import mongoose from 'mongoose';

export async function getConsultationDetails(req, res) {
    try {
        const id = (req.body.id || req.query.id || req.body.ticket_id || req.query.ticket_id || '').trim();

        if (!id) {
            return res.json({ status: false, message: 'ID or ticket_id required' });
        }

        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
            query.$or = [{ _id: id }, { ticket_id: id }];
        } else {
            query.ticket_id = id;
        }

        const data = await Consultation.findOne(query).lean();
        if (!data) {
            return res.json({ status: false, message: 'Consultation ticket not found' });
        }
        
        return res.json({ status: true, data });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}