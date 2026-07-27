import { Consultation } from '../../../../models/Consultation.js';
import mongoose from 'mongoose';

export async function deleteConsultation(req, res) {
    try {
        const id = (req.body.ticket_id || req.query.ticket_id || req.body.id || req.query.id || '').trim();
        if (!id) {
            return res.json({ status: false, message: 'id / ticket_id is required' });
        }

        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
            query.$or = [{ _id: id }, { ticket_id: id }];
        } else {
            query.ticket_id = id;
        }

        const cons = await Consultation.findOne(query);
        if (!cons) return res.json({ status: false, message: 'Consultation ticket not found' });

        await Consultation.deleteOne({ _id: cons._id });

        return res.json({ status: true, message: 'Consultation ticket deleted successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
