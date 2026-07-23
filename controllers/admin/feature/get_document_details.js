import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import mongoose from 'mongoose';

export async function getDocumentDetails(req, res) {
    try {
        const id = (req.body.id || req.query.id || '').trim();
        const loan_application_id = (req.body.loan_application_id || req.query.loan_application_id || '').trim();

        if (!id && !loan_application_id) {
            return res.json({ status: false, message: 'Please provide id or loan_application_id' });
        }

        let query = {};
        if (id) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                query._id = id;
            } else {
                query.loan_application_id = id;
            }
        } else if (loan_application_id) {
            query.loan_application_id = loan_application_id;
        }

        const doc = await LoanApplicationDocuments.findOne(query).lean();
        if (!doc) return res.json({ status: false, message: 'Record not found' });
        
        return res.json({ status: true, message: 'Document details fetched successfully', data: doc });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}