import { Consultation } from '../../../../models/Consultation.js';
export async function getTicketList(req, res) {
    try {
        await Consultation.updateMany({ status: 'Open', $or: [{ remarks: null }, { remarks: '' }, { remarks: { $exists: false } }] }, { $set: { status: 'Pending' } });
        const list = await Consultation.find({}).sort({ _id: -1 }).lean();
        return res.json({ status: true, data: list });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}