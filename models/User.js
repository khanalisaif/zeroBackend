import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true },
    number: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, default: null },
    account_status: { type: String, default: 'active' },
    profile_pic: { type: String, default: null },
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    access_token_expires_at: { type: Date, default: null },
    refresh_token_expires_at: { type: Date, default: null },
    last_login_at: { type: Date, default: null },
    application_ids: { type: String, default: null } // Storing JSON string array of IDs like in MySQL or we could use Array
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = mongoose.model('User', userSchema);
