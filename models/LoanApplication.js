import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    number: { type: String, trim: true },
    email: { type: String, trim: true },
    loan_type: { type: String, trim: true },
    city: { type: String, trim: true, default: '' },
    profession: { type: String, trim: true, default: '' },
    pan_number: { type: String, trim: true, default: '' },
    monthly_income: { type: String, trim: true, default: '' },
    tenure: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    business_name: { type: String, trim: true, default: '' },
    loan_amount: { type: Number },
    status: { type: String, default: 'Pending' },
    application_token: { type: String },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    Document_Status: { type: String, default: 'Pending' },
    is_viewed: { type: Boolean, default: false },
    viewed_at: { type: Date, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema, 'loan_application');