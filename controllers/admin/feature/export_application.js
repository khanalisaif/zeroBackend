import { LoanApplication } from '../../../models/LoanApplication.js';

export async function exportApplication(req, res) {
    try {
        const ids = req.body.ids;
        const query = Array.isArray(ids) && ids.length > 0 ? { _id: { $in: ids } } : {};
        const apps = await LoanApplication.find(query).sort({ _id: -1 }).lean();
        return res.json({ status: true, data: apps });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}