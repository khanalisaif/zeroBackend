// Module 7.6 - 7.8: Documents Vault Controller
// Docs: 7.6 GET /api/documents/index, 7.7 POST /api/documents/upload, 7.8 DELETE /api/documents/delete

import crypto from 'crypto';
import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import { VaultDocument } from '../../../models/VaultDocument.js';

// 7.6 GET /api/documents/index
export const getDocuments = async (req, res) => {
    try {
        const docs = await VaultDocument.find({ user_id: req.user._id }).sort({ created_at: -1 });
        return sendSuccess(res, 200, 'Documents retrieved.', {
            total: docs.length,
            documents: docs.map(d => ({
                id: d.doc_id,
                category: d.category,
                title: d.title,
                file_name: d.file_name,
                file_size: d.file_size,
                status: d.status,
                upload_date: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            }))
        });
    } catch (e) {
        return sendError(res, 500, e.message);
    }
};

// 7.7 POST /api/documents/upload
export const uploadDocument = async (req, res) => {
    try {
        const { category, title, file_name, file_size } = req.body;
        if (!category || !title) {
            return sendError(res, 422, 'category and title are required.');
        }

        const doc_id = 'DOC-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const uploadedFile = req.file;

        const resolvedFileName = uploadedFile?.originalname || file_name || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
        const resolvedFileSize = uploadedFile ? `${(uploadedFile.size / 1024).toFixed(0)} KB` : (file_size || '1.1 MB');
        const resolvedFileUrl = uploadedFile ? `/uploads/documents/${uploadedFile.filename}` : `/uploads/documents/${doc_id}.pdf`;

        const newDoc = new VaultDocument({
            doc_id,
            user_id: req.user._id,
            category,
            title,
            file_name: resolvedFileName,
            file_size: resolvedFileSize,
            file_url: resolvedFileUrl,
            status: 'PENDING_VERIFICATION'
        });

        await newDoc.save();

        return res.status(201).json({
            success: true,
            message: 'Document uploaded successfully.',
            data: {
                id: doc_id,
                category: newDoc.category,
                title: newDoc.title,
                file_name: newDoc.file_name,
                file_size: newDoc.file_size,
                file_url: newDoc.file_url,
                status: newDoc.status,
                upload_date: new Date().toISOString().split('T')[0]
            }
        });
    } catch (e) {
        return sendError(res, 500, e.message);
    }
};

// 7.8 DELETE /api/documents/delete
export const deleteDocument = async (req, res) => {
    try {
        const docId = req.query.id || req.body.id;
        if (!docId) {
            return sendError(res, 422, 'id is required.');
        }

        const doc = await VaultDocument.findOneAndDelete({
            user_id: req.user._id,
            $or: [{ doc_id: docId }, { _id: docId }]
        });

        if (!doc) {
            return sendError(res, 404, 'Document not found or already deleted.');
        }

        return sendSuccess(res, 200, 'Document deleted successfully.', {
            deleted_id: doc.doc_id || docId
        });
    } catch (e) {
        return sendError(res, 500, e.message);
    }
};
