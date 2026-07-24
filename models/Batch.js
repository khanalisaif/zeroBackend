import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    application_count: { type: Number, default: 0 },
    application_ids: { type: [mongoose.Schema.Types.ObjectId], ref: 'LoanApplication', default: [] }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Batch = mongoose.model('Batch', batchSchema, 'batches');
