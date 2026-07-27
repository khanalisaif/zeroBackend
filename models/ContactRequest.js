import mongoose from 'mongoose';

const contactRequestSchema = new mongoose.Schema({
    full_name: { type: String, trim: true, required: true },
    mobile: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    subject: { type: String, trim: true, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'New' },
    remarks: { type: String, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema, 'contact_requests');