import { Consultation } from '../../../../models/Consultation.js';
import { sendTemplateMail } from '../../../../services/email/mail_helper.js';
import mongoose from 'mongoose';

export async function updateConsultation(req, res) {
    try {
        const id = (req.body.ticket_id || req.query.ticket_id || req.body.id || req.query.id || '').trim();
        const status = (req.body.status || req.query.status || '').trim();
        const remarks = (req.body.remarks || req.query.remarks || '').trim();
        const priority = (req.body.priority || req.query.priority || '').trim();

        if (!id || !status) return res.json({ status: false, message: 'Missing fields: id/ticket_id and status required' });

        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
            query.$or = [{ _id: id }, { ticket_id: id }];
        } else {
            query.ticket_id = id;
        }

        const cons = await Consultation.findOne(query).lean();
        if (!cons) return res.json({ status: false, message: 'Not found' });

        const updates = { status, remarks };
        if (priority) updates.priority = priority;

        await Consultation.updateOne({ _id: cons._id }, updates);
        sendTemplateMail(cons.email, 'consultation_update', { ticket_id: cons.ticket_id, status, remarks }).catch(() => {});
        
        return res.json({ status: true, message: 'Ticket updated' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}