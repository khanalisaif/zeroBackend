import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: { type: String, trim: true, default: '' },
    last_name: { type: String, trim: true, default: '' },
    name: { type: String, trim: true }, // kept for backward compat; auto-set from first_name + last_name
    full_name: { type: String, trim: true }, // As per doc
    email: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true }, // As per doc
    number: { type: String, trim: true }, // backward compat
    pan: { type: String, trim: true, default: null }, // As per doc
    pan_number: { type: String, trim: true, default: null }, // backward compat
    earning_resource: { type: String, default: 'Employed' },
    annual_salary: { type: String, default: '₹ 0' },
    annual_turnover: { type: String, default: '₹ 0' },
    gender: { type: String, default: null },
    profession: { type: String, default: null },
    address: { type: mongoose.Schema.Types.Mixed, default: null }, // can be string or object
    password: { type: String, default: null },
    account_status: { type: String, default: 'active' },
    profile_pic: { type: String, default: null },
    avatar_url: { type: String, default: null }, // As per doc
    delete_account_status: { type: Boolean, default: false },
    delete_account_days_left: { type: Number, default: 0 },
    delete_account_request_time: { type: Date, default: null },
    delete_account_time: { type: Date, default: null },
    deletion_reason: { type: String, default: null },
    device: { type: String, default: null },
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    access_token_expires_at: { type: Date, default: null },
    refresh_token_expires_at: { type: Date, default: null },
    last_login_at: { type: Date, default: null },
    application_ids: { type: String, default: null } // StoringJSON string array of IDs like in MySQL or we could use Array
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = mongoose.model('User', userSchema);
