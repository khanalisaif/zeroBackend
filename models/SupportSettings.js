import mongoose from 'mongoose';

// Singleton support settings document (only one record in DB)
const supportSettingsSchema = new mongoose.Schema({
    singleton_key: { type: String, default: 'support_settings', unique: true },
    phone: { type: String, default: '1800-200-8899' },
    phone_dial: { type: String, default: '18002008899' },
    phone_hours: { type: String, default: '9 AM - 9 PM' },
    email: { type: String, default: 'loans@zerocommission.finance' },
    title: { type: String, default: 'Support & Help' },
    subtitle: { type: String, default: 'Our dedicated credit advisors are here to help resolve any questions about your loan applications.' },
    chat_enabled: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const SupportSettings = mongoose.model('SupportSettings', supportSettingsSchema, 'support_settings');
