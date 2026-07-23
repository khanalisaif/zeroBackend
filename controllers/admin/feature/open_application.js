import { LoanApplication } from '../../../models/LoanApplication.js';
import mongoose from 'mongoose';

export async function openApplication(req, res) {
    try {
        const id = (req.query.id || req.body.id || req.query.loan_application_id || req.body.loan_application_id || '').trim();
        if (!id) return res.json({ status: false, message: 'ID required' });

        const app = await LoanApplication.findById(id).lean();
        if (!app) return res.json({ status: false, message: 'Application not found' });

        return res.json({ status: true, data: app });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}