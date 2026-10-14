import mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, default: 'Home' },
    full_address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    is_default: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export const Address = mongoose.model('Address', addressSchema);