import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, trim: true },
    otp: { type: String, required: true },
    attempt_count: { type: Number, default: 0 },
    expires_at: { type: Date, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const Otp = mongoose.model('Otp', otpSchema, 'login_otp');