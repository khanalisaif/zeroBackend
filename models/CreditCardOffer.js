import mongoose from 'mongoose';
const cardSchema = new mongoose.Schema({
    card_name: { type: String, required: true },
    bank_name: { type: String, required: true },
    card_type: { type: String },
    annual_fee: { type: String },
    joining_fee: { type: String },
    cashback_rate: { type: String },
    credit_limit_estimate: { type: String },
    key_benefits: [{ type: String }],
    is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export const CreditCardOffer = mongoose.model('CreditCardOffer', cardSchema);