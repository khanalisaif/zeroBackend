import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { VaultDocument } from '../../../models/VaultDocument.js';
import mongoose from 'mongoose';

export async function getDocumentDetails(req, res) {
    try {
        const id = (req.body.id || req.query.id || '').trim();
        const doc_id = (req.body.doc_id || req.query.doc_id || '').trim();
        const loan_application_id = (req.body.loan_application_id || req.query.loan_application_id || '').trim();

        const param = (id || doc_id || loan_application_id || '').trim();

        if (!param) {
            return res.status(400).json({ status: false, success: false, message: 'Please provide id, doc_id, or loan_application_id' });
        }

        // 1. Check if param is a Vault Document ID (e.g., DOC-24C615)
        if (param.toUpperCase().startsWith('DOC-')) {
            const vaultDoc = await VaultDocument.findOne({ doc_id: param.toUpperCase() })
                .populate('user_id', 'full_name name email phone number')
                .lean();

            if (vaultDoc) {
                return res.json({
                    status: true,
                    success: true,
                    message: 'Document details fetched successfully',
                    data: {
                        id: vaultDoc.doc_id,
                        doc_id: vaultDoc.doc_id,
                        _id: vaultDoc._id,
                        title: vaultDoc.title,
                        category: vaultDoc.category,
                        file_name: vaultDoc.file_name,
                        file_size: vaultDoc.file_size,
                        file_url: vaultDoc.file_url,
                        document_status: vaultDoc.status,
                        status: vaultDoc.status,
                        user: vaultDoc.user_id || null,
                        created_at: vaultDoc.created_at,
                        updated_at: vaultDoc.updated_at
                    }
                });
            }
        }

        // 2. If param is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(param)) {
            // Check VaultDocument by _id
            const vaultDoc = await VaultDocument.findById(param)
                .populate('user_id', 'full_name name email phone number')
                .lean();

            if (vaultDoc) {
                return res.json({
                    status: true,
                    success: true,
                    message: 'Document details fetched successfully',
                    data: {
                        id: vaultDoc.doc_id,
                        doc_id: vaultDoc.doc_id,
                        _id: vaultDoc._id,
                        title: vaultDoc.title,
                        category: vaultDoc.category,
                        file_name: vaultDoc.file_name,
                        file_size: vaultDoc.file_size,
                        file_url: vaultDoc.file_url,
                        document_status: vaultDoc.status,
                        status: vaultDoc.status,
                        user: vaultDoc.user_id || null,
                        created_at: vaultDoc.created_at,
                        updated_at: vaultDoc.updated_at
                    }
                });
            }

            // Check LoanApplicationDocuments by _id or loan_application_id
            const ladDoc = await LoanApplicationDocuments.findOne({
                $or: [{ _id: param }, { loan_application_id: param }]
            }).populate('loan_application_id').lean();

            if (ladDoc) {
                return res.json({
                    status: true,
                    success: true,
                    message: 'Document details fetched successfully',
                    data: ladDoc
                });
            }
        }

        // 3. Check if param is a loan application token (e.g., APP-XXXX)
        const app = await LoanApplication.findOne({
            $or: [{ application_token: param }, { application_id: param }]
        }).lean();

        if (app) {
            const ladDoc = await LoanApplicationDocuments.findOne({ loan_application_id: app._id })
                .populate('loan_application_id')
                .lean();

            if (ladDoc) {
                return res.json({
                    status: true,
                    success: true,
                    message: 'Document details fetched successfully',
                    data: ladDoc
                });
            }
        }

        // 4. Case-insensitive fallback check for VaultDocument
        const fallbackVaultDoc = await VaultDocument.findOne({ doc_id: new RegExp(`^${param}$`, 'i') })
            .populate('user_id', 'full_name name email phone number')
            .lean();

        if (fallbackVaultDoc) {
            return res.json({
                status: true,
                success: true,
                message: 'Document details fetched successfully',
                data: fallbackVaultDoc
            });
        }

        return res.status(404).json({ status: false, success: false, message: 'Record not found' });
    } catch (err) {
        return res.status(500).json({ status: false, success: false, message: 'Server error', error: err.message });
    }
}