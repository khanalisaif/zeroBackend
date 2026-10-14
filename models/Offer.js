import mongoose from 'mongoose';
const offerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    bank_name: { type: String, required: true },
    bank_logo_url: { type: String },
    banner_image_url: { type: String },
    badge_text: { type: String },
    interest_rate_value: { type: Number },
    interest_rate_formatted: { type: String },
    max_amount_value: { type: Number },
    max_amount_formatted: { type: String },
    tenure_formatted: { type: String },
    is_pre_approved: { type: Boolean, default: true },
    processing_fee: { type: String },
    key_features: [{ type: String }],
    eligibility_criteria: [{ type: String }],
    required_documents: [{ type: String }],
    is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export const Offer = mongoose.model('Offer', offerSchema);