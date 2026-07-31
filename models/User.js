import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: { type: String, trim: true, default: '' },
    last_name: { type: String, trim: true, default: '' },
    name: { type: String, trim: true }, // kept for backward compat; auto-set from first_name + last_name
    email: { type: String, unique: true, sparse: true, trim: true },
    number: { type: String, unique: true, sparse: true, trim: true },
    pan_number: { type: String, trim: true, default: null },
    password: { type: String, default: null },
    account_status: { type: String, default: 'active' },
    profile_pic: { type: String, default: null },
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    access_token_expires_at: { type: Date, default: null },
    refresh_token_expires_at: { type: Date, default: null },
    last_login_at: { type: Date, default: null },
    application_ids: { type: String, default: null } // StoringJSON string array of IDs like in MySQL or we could use Array
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = mongoose.model('User', userSchema);
