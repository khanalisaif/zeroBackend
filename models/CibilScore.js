import mongoose from 'mongoose';
const cibilSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    score: { type: Number, default: 750 },
    rating: { type: String, default: 'Good' },
    rating_description: { type: String, default: 'Your credit profile is good.' },
    change_delta: { type: String, default: '+0' },
    last_updated: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export const CibilScore = mongoose.model('CibilScore', cibilSchema);