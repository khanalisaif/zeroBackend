import { Faq } from '../../../../models/Faq.js';
export async function addFaq(req, res) {
    try {
        const q = (req.body.question || '').trim();
        const a = (req.body.answer || '').trim();
        if (!q || !a) return res.json({ status: false, message: 'Missing fields' });
        await Faq.create({ question: q, answer: a });
        return res.json({ status: true, message: 'FAQ added successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}