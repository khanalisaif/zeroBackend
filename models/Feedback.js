import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    feedback_id: { type: String, required: true, unique: true, trim: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    category: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: null },
    status: { type: String, default: 'PENDING' },
    admin_reply: { type: String, default: null },
    submitted_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks');
