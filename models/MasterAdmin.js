import mongoose from 'mongoose';

const masterAdminSchema = new mongoose.Schema({
    name: { type: String, default: 'Master Admin', trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    access_token_expires_at: { type: Date, default: null },
    refresh_token_expires_at: { type: Date, default: null },
    last_login_at: { type: Date, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const MasterAdmin = mongoose.model('MasterAdmin', masterAdminSchema);
