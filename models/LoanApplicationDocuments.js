import mongoose from 'mongoose';

const loanApplicationDocumentsSchema = new mongoose.Schema({
    loan_application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
    pancard_url: { type: String, default: null },
    adharcard_url: { type: String, default: null },
    salary_slips_url: { type: String, default: null },
    bank_statement_url: { type: String, default: null },
    employment_letter_url: { type: String, default: null },
    business_registration_url: { type: String, default: null },
    gst_returns_url: { type: String, default: null },
    moa_url: { type: String, default: null },
    document_status: { type: String, default: 'Pending' },
    remarks: { type: String, default: null },
    uploaded_at: { type: Date, default: Date.now }
});

export const LoanApplicationDocuments = mongoose.model('LoanApplicationDocuments', loanApplicationDocumentsSchema, 'loan_application_documents');