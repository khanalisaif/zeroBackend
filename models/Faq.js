import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    category: { type: String, trim: true, default: null },
    question: { type: String, required: true },
    answer: { type: String, default: null },
    status: { type: String, default: 'active' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Faq = mongoose.model('Faq', faqSchema, 'faq');