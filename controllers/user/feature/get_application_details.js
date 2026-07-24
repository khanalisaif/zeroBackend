import mongoose from 'mongoose';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';

export async function getApplicationDetails(req, res) {
    try {
        const id = (req.body.application_id || req.body.id || req.body.loan_application_id || req.query.application_id || req.query.id || req.query.loan_application_id || '').trim();
        if (!id) return res.json({ status: false, message: 'ID required' });
        if (!mongoose.isValidObjectId(id)) return res.json({ status: false, message: 'Invalid ID format' });

        const app = await LoanApplication.findById(id).lean();
        if (!app) return res.json({ status: false, message: 'Not found' });

        const history = await LoanApplicationHistory.findOne({ loan_application_id: id }).sort({ _id: -1 }).lean();
        const docs = await LoanApplicationDocuments.findOne({ loan_application_id: id }).sort({ _id: -1 }).lean();

        app.status = history ? history.status : app.status;
        app.remarks = history ? history.case_history : '';
        app.documents = docs;

        return res.json({ status: true, data: app });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}