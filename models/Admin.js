import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    number: { type: String, trim: true },
    role: { type: String, default: 'admin' },
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    access_token_expires_at: { type: Date, default: null },
    refresh_token_expires_at: { type: Date, default: null },
    last_login_at: { type: Date, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Admin = mongoose.model('Admin', adminSchema);
