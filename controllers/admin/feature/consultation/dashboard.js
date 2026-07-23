import { Consultation } from '../../../../models/Consultation.js';
export async function getDashboard(req, res) {
    try {
        const total = await Consultation.countDocuments();
        const open = await Consultation.countDocuments({ status: 'Open' });
        return res.json({ status: true, data: { total, open } });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}