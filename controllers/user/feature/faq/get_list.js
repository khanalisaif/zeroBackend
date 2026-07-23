import { Faq } from '../../../../models/Faq.js';
export async function getFaqList(req, res) {
    try {
        const list = await Faq.find({ status: 'active' }).sort({ _id: -1 }).lean();
        return res.json({ status: true, data: list });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}