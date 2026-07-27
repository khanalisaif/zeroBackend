import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
    ticket_id: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customer_name: { type: String, trim: true },
    phone_number: { type: String, trim: true },
    email: { type: String, trim: true },
    subject: { type: String, required: true },
    issue: { type: String, required: true },
    priority: { type: String, default: 'Normal' },
    status: { type: String, default: 'Pending' },
    remarks: { type: String, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Consultation = mongoose.model('Consultation', consultationSchema, 'consultation');