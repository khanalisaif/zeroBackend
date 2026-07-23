import mongoose from 'mongoose';

const loanApplicationHistorySchema = new mongoose.Schema({
    loan_application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
    status: { type: String, required: true },
    case_history: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const LoanApplicationHistory = mongoose.model('LoanApplicationHistory', loanApplicationHistorySchema, 'loan_application_history');