import { Otp } from '../../../models/Otp.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';

export async function verifyOtp(req, res) {
    try {
        const email = (req.body.email || '').trim();
        const otpInput = (req.body.otp || '').trim();

        await Otp.deleteMany({ expires_at: { $lte: new Date() } });

        const otpRecord = await Otp.findOne({ email }).sort({ _id: -1 }).lean();
        if (!otpRecord) return res.json({ status: false, message: 'OTP expired or invalid' });

        if (otpRecord.attempt_count >= 3) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.json({ status: false, message: 'Max attempts reached' });
        }

        if (otpRecord.otp !== otpInput) {
            await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempt_count: 1 } });
            return res.json({ status: false, message: 'Incorrect OTP' });
        }

        await Otp.deleteOne({ _id: otpRecord._id });

        const app = await LoanApplication.findOne({ email }).sort({ _id: -1 }).lean();
        if (!app) return res.json({ status: true, message: 'OTP verified, no application found', application_token: null });

        // Fetch all history entries to build timeline
        const historyList = await LoanApplicationHistory.find({ loan_application_id: app._id }).sort({ _id: 1 }).lean();
        const docs = await LoanApplicationDocuments.findOne({ loan_application_id: app._id }).sort({ _id: -1 }).lean();

        // Latest history entry for current status
        const latestHistory = historyList.length ? historyList[historyList.length - 1] : null;
        const currentStatus = latestHistory?.status || app.status || 'Pending';
        const documentStatus = docs?.document_status || app.Document_Status || 'Pending';

        // Build timeline array matching get_my_applications
        let timeline = [];
        if (latestHistory && latestHistory.case_history) {
            try {
                const parsed = typeof latestHistory.case_history === 'string'
                    ? JSON.parse(latestHistory.case_history)
                    : latestHistory.case_history;
                if (Array.isArray(parsed)) timeline = parsed;
            } catch (_) {
                timeline = [];
            }
        }
        if (timeline.length === 0) {
            timeline.push({
                title: 'Application Submitted',
                summary: 'Loan application submitted successfully.',
                datetime: app.created_at ? app.created_at.toISOString() : null,
            });
            if (docs && docs.created_at) {
                timeline.push({
                    title: 'Documents Uploaded',
                    summary: 'Documents submitted successfully.',
                    datetime: docs.created_at.toISOString(),
                });
            }
            for (const h of historyList) {
                if (h.status && !['Pending', 'pending'].includes(h.status)) {
                    timeline.push({
                        title: h.status,
                        summary: h.case_history || '',
                        datetime: h.created_at ? h.created_at.toISOString() : null,
                    });
                }
            }
        }

        return res.json({
            status: true,
            message: 'OTP verified successfully',
            application_token: app.application_token || null,
            loan_application_id: app._id,
            loan_type: app.loan_type || '',
            name: app.name || '',
            phone: app.number || '',
            current_status: currentStatus,
            document_status: documentStatus,
            remarks: latestHistory?.case_history || '',
            timeline,
            created_at: app.created_at || null,
            last_updated_at: app.updated_at || null,
            document_ids: docs ? [docs._id] : [],
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}