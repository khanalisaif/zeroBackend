import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { User } from '../../../models/User.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function applyLoan(req, res) {
    try {
        const name = (req.body.name || '').trim();
        const number = (req.body.number || '').trim();
        const email = (req.body.email || '').trim();
        const loan_type = (req.body.loan_type || '').trim();
        const city = (req.body.city || '').trim();
        const profession = (req.body.profession || '').trim();
        const pan_number = (req.body.pan_number || '').trim();
        const monthly_income = (req.body.monthly_income || '').trim();
        const loan_amount = (req.body.loan_amount || '').trim();
        const tenure = (req.body.tenure || '').trim();
        const description = (req.body.description || req.body.message || '').trim();

        if (!name || !number || !email || !loan_type || !profession || !loan_amount) {
            return res.status(400).json({ status: false, message: 'All mandatory fields are required.' });
        }

        let cleanPan = '';
        if (pan_number) {
            cleanPan = pan_number.toUpperCase();
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(cleanPan)) {
                return res.status(400).json({ status: false, message: 'Invalid PAN card format.' });
            }
        }

        // Generate application token matching PHP (ZCL + YYMMDD + 5 hex)
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomHex = Math.floor(Math.random() * 0xFFFFF).toString(16).toUpperCase().padStart(5, '0');
        const application_token = `ZCL${datePart}${randomHex}`;

        const newApp = await LoanApplication.create({
            name,
            number,
            email,
            loan_type,
            city,
            profession,
            pan_number: cleanPan,
            monthly_income,
            loan_amount,
            tenure,
            description,
            application_token,
            status: 'PENDING',
            Document_Status: 'PENDING'
        });

        const caseHistory = [{
            title: 'Application Submitted',
            summary: 'Loan application submitted successfully.',
            datetime: new Date().toISOString(),
            status: 'Pending'
        }];

        await LoanApplicationHistory.create({
            loan_application_id: newApp._id,
            status: 'Pending',
            case_history: JSON.stringify(caseHistory)
        });

        // Add default documents record
        await LoanApplicationDocuments.create({
            loan_application_id: newApp._id,
            document_status: 'PENDING'
        });

        // Only link to an existing user if one already exists; DO NOT create a new user!
        const existingUser = await User.findOne({
            $or: [
                ...(email ? [{ email: { $regex: new RegExp(`^${email}$`, 'i') } }] : []),
                ...(number ? [{ number: number }] : [])
            ]
        }).lean();

        if (existingUser) {
            const userId = existingUser._id;
            await LoanApplication.updateOne({ _id: newApp._id }, { user_id: userId });

            let applications = [];
            if (existingUser.application_ids) {
                try {
                    applications = JSON.parse(existingUser.application_ids);
                    if (!Array.isArray(applications)) applications = [];
                } catch (e) {
                    applications = [];
                }
            }

            if (!applications.includes(newApp._id.toString())) {
                applications.push(newApp._id.toString());
            }

            await User.updateOne({ _id: userId }, { application_ids: JSON.stringify(applications) });
        }

        // Send email and await so Node doesn't terminate before dispatch
        try {
            const mailRes = await sendTemplateMail(email, 'application_submitted', { application_token });
            console.log('applyLoan application_submitted email sent:', mailRes);
        } catch (mailErr) {
            console.error('applyLoan email sending failed:', mailErr);
        }

        return res.json({
            status: true,
            message: `Loan application submitted successfully. Your Application Token is ${application_token}`,
            application_token
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}