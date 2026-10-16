import mongoose from 'mongoose';

const panVerificationSchema = new mongoose.Schema({
    pan_verification_id: { type: String, required: true, unique: true, trim: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pan: { type: String, required: true, trim: true, uppercase: true },
    dob: { type: String, trim: true },
    full_name: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    otp: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
    verification_token: { type: String, default: null },
    expires_at: { type: Date, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Expire document automatically after expires_at
panVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const PanVerification = mongoose.model('PanVerification', panVerificationSchema);
