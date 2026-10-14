import mongoose from 'mongoose';

const pendingRegistrationSchema = new mongoose.Schema({
    full_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    pan: { type: String, required: true, trim: true },
    earning_resource: { type: String, default: 'Employed' },
    annual_salary: { type: String, default: '₹ 8,00,000' },
    annual_turnover: { type: String, default: '₹ 0' },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    profile_image: { type: String, default: null },
    expires_at: { type: Date, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Automatically delete document when expires_at is reached
pendingRegistrationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);
