import { LoanApplication } from '../../../models/LoanApplication.js';

export async function getBatches(req, res) {
    try {
        const total = await LoanApplication.countDocuments();
        return res.json({ status: true, total_records: total });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}