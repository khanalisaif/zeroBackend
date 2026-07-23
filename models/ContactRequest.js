import mongoose from 'mongoose';

const contactRequestSchema = new mongoose.Schema({
    full_name: { type: String, trim: true, required: true },
    mobile: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    subject: { type: String, trim: true, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'New' }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema, 'contact_requests');