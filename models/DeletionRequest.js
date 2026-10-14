import mongoose from 'mongoose';
const deletionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deleteduration: { type: Number, default: 30 },
    deletion_reason: { type: String },
    device_info: { type: String },
    status: { type: String, default: 'PENDING' },
    delete_account_time: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export const DeletionRequest = mongoose.model('DeletionRequest', deletionSchema);