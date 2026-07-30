import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import mongoose from 'mongoose';

export async function getDocumentDetails(req, res) {
    try {
        const id = (req.body.id || req.query.id || '').trim();
        const loan_application_id = (req.body.loan_application_id || req.query.loan_application_id || '').trim();

        if (!id && !loan_application_id) {
            return res.json({ status: false, message: 'Please provide id or loan_application_id' });
        }

        const param = (id || loan_application_id || '').trim();

        const queryConditions = [];
        if (mongoose.Types.ObjectId.isValid(param)) {
            queryConditions.push({ _id: param });
            queryConditions.push({ loan_application_id: param });
        }

        let loanAppId = param;
        if (!mongoose.Types.ObjectId.isValid(param)) {
            const app = await LoanApplication.findOne({ application_token: param }).lean();
            if (app) {
                loanAppId = app._id;
            }
        }
        queryConditions.push({ loan_application_id: loanAppId });

        const doc = await LoanApplicationDocuments.findOne({ $or: queryConditions }).sort({ _id: -1 }).lean();
        if (!doc) return res.json({ status: false, message: 'Record not found' });
        
        return res.json({ status: true, message: 'Document details fetched successfully', data: doc });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}