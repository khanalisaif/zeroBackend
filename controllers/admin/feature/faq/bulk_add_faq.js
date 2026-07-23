import { Faq } from '../../../../models/Faq.js';
export async function bulkAddFaq(req, res) {
    try {
        if (!req.body.faqs || !Array.isArray(req.body.faqs)) return res.json({ status: false, message: 'Invalid data format' });
        const ops = req.body.faqs.filter(f => f.question && f.answer).map(f => ({ question: f.question, answer: f.answer }));
        if (ops.length === 0) return res.json({ status: false, message: 'No valid FAQs' });
        await Faq.insertMany(ops);
        return res.json({ status: true, message: 'FAQs added in bulk' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}