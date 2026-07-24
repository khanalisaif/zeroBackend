import { Faq } from '../../../../models/Faq.js';

const allowedCategories = [
    "General Questions", "Loan Eligibility", "Loan Application",
    "Loan Approval", "Loan Disbursement", "CIBIL & Credit Score",
    "Interest Rate & EMI", "Charges & Fees", "Zero Commission & Cashback",
    "Loan Rejection", "Foreclosure & Prepayment", "Documents"
];

export async function bulkAddFaq(req, res) {
    try {
        const data = req.body;
        if (!Array.isArray(data) || data.length === 0)
            return res.json({ status: false, message: 'Invalid JSON data.' });

        let success = 0;
        const failed = [];

        for (let i = 0; i < data.length; i++) {
            const faq = data[i];
            const category = (faq.category || '').trim();
            const question = (faq.question || '').trim();
            const answer = (faq.answer || '').trim();

            if (!category || !question || !answer) {
                failed.push({ index: i, reason: 'Missing required fields.' });
                continue;
            }
            if (!allowedCategories.includes(category)) {
                failed.push({ index: i, reason: 'Invalid category.' });
                continue;
            }
            try {
                await Faq.create({ category, question, answer });
                success++;
            } catch (e) {
                failed.push({ index: i, reason: 'Database error.' });
            }
        }

        return res.json({
            status: true,
            message: 'Bulk FAQ upload completed.',
            total: data.length,
            success,
            failed: failed.length,
            errors: failed
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}