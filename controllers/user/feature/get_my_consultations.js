import { Consultation } from '../../../models/Consultation.js';

export async function getMyConsultations(req, res) {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

        const email = user.email || '';
        const number = user.number || '';

        if (!email && !number) {
            return res.json({ status: true, data: [] });
        }

        const query = [];
        if (email) query.push({ email });
        if (number) query.push({ phone_number: number });

        const consultations = await Consultation.find({ $or: query }).sort({ _id: -1 }).lean();

        return res.json({ status: true, data: consultations });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
