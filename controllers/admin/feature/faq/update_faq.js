import { Faq } from '../../../../models/Faq.js';
export async function updateFaq(req, res) {
    try {
        const id = (req.body.id || '').trim();
        const category = (req.body.category || '').trim();
        const q = (req.body.question || '').trim();
        const a = (req.body.answer || '').trim();
        const status = (req.body.status || '').trim();
        if (!id) return res.json({ status: false, message: 'ID required' });
        let updates = {};
        if (category) updates.category = category;
        if (q) updates.question = q;
        if (a) updates.answer = a;
        if (status) updates.status = status;
        await Faq.updateOne({ _id: id }, updates);
        return res.json({ status: true, message: 'FAQ updated' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}