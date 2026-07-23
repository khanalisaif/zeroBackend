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
        if (!app) return res.json({ status: true, message: 'OTP verified, no application found', application_id: null });

        const history = await LoanApplicationHistory.findOne({ loan_application_id: app._id }).sort({ _id: -1 }).lean();
        const docs = await LoanApplicationDocuments.findOne({ loan_application_id: app._id }).sort({ _id: -1 }).lean();

        return res.json({
            status: true,
            message: 'OTP verified successfully',
            application_id: app._id,
            status: history ? history.status : app.status,
            remarks: history ? history.case_history : '',
            document_status: docs ? docs.document_status : 'Pending',
            documents: docs
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}