import mongoose from 'mongoose';
const accSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bank_name: { type: String, required: true },
    account_type: { type: String, required: true },
    account_number_masked: { type: String },
    sanctioned_amount: { type: Number, default: 0 },
    current_outstanding: { type: Number, default: 0 },
    interest_rate: { type: String },
    tenure_months: { type: Number },
    remaining_tenure_months: { type: Number },
    open_date: { type: Date },
    account_status: { type: String, default: 'ACTIVE' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export const CreditAccount = mongoose.model('CreditAccount', accSchema);