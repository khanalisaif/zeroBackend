import { Faq } from '../../../../models/Faq.js';
export async function deleteFaq(req, res) {
    try {
        const id = (req.body.id || '').trim();
        if (!id) return res.json({ status: false, message: 'ID required' });
        await Faq.deleteOne({ _id: id });
        return res.json({ status: true, message: 'FAQ deleted' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}