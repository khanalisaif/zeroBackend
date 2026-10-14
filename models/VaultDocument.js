import mongoose from 'mongoose';

const vaultDocumentSchema = new mongoose.Schema({
    doc_id: { type: String, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    file_name: { type: String, default: '' },
    file_size: { type: String, default: '' },
    file_url: { type: String, default: '' },
    status: { type: String, default: 'PENDING_VERIFICATION' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const VaultDocument = mongoose.model('VaultDocument', vaultDocumentSchema);
