import mongoose from 'mongoose';

const contactRequestSchema = new mongoose.Schema({
    full_name: { type: String, trim: true, default: 'Applicant' },
    mobile: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    loan_type: { type: String, trim: true, default: null },
    email: { type: String, trim: true, default: null },
    subject: { type: String, trim: true, default: 'Support Query' },
    message: { type: String, required: true },
    status: { type: String, default: 'New' },
    remarks: { type: String, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema, 'contact_requests');