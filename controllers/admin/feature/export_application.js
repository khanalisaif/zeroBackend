import { LoanApplication } from '../../../models/LoanApplication.js';

export async function exportApplication(req, res) {
    try {
        const apps = await LoanApplication.find({}).sort({ _id: -1 }).lean();
        return res.json({ status: true, data: apps });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}