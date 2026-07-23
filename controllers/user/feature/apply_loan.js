import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { User } from '../../../models/User.js';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { createUser as _createUser } from '../../../models/userFunctions.js';

export async function applyLoan(req, res) {
    try {
        const name = (req.body.name || '').trim();
        const number = (req.body.number || '').trim();
        const email = (req.body.email || '').trim();
        const loan_type = (req.body.loan_type || '').trim();
        const city = (req.body.city || '').trim();
        const profession = (req.body.profession || '').trim();
        const business_name = (req.body.business_name || '').trim();
        const loan_amount = parseFloat(req.body.loan_amount) || 0;
        const status = (req.body.status || 'PENDING').trim();

        if (!name || !number || !email || !loan_type || !profession || !loan_amount) {
            return res.json({ status: false, message: 'Required fields missing' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ status: false, message: 'Invalid email address' });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(number)) {
            return res.json({ status: false, message: 'Invalid mobile number' });
        }

        const existingApp = await LoanApplication.findOne({ number, loan_type }).lean();
        if (existingApp) {
            return res.json({
                status: false,
                message: `You have already applied for this loan. Your Application Token is ${existingApp.application_token}`,
                application_token: existingApp.application_token
            });
        }

        const newApp = await LoanApplication.create({
            name, number, email, loan_type, city, profession, business_name, loan_amount, status
        });

        // Generate Application Token similar to PHP ZCLYYMM + ID
        const dateStr = new Date().toISOString().slice(2, 7).replace('-', ''); // YYMM
        const idStr = newApp._id.toString().slice(-6).toUpperCase();
        const application_token = `ZCL${dateStr}${idStr}`;

        await LoanApplication.updateOne({ _id: newApp._id }, { application_token });

        // Add history
        const caseHistory = [{
            title: "Application Submitted",
            datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            summary: "Loan application submitted successfully."
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

        // Create or get user
        const userResult = await _createUser(number, email);
        if (userResult.status) {
            const userId = userResult.user_id;
            await LoanApplication.updateOne({ _id: newApp._id }, { user_id: userId });

            const user = await User.findById(userId).lean();
            let applications = [];
            if (user && user.application_ids) {
                try {
                    applications = JSON.parse(user.application_ids);
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

        // Send email
        sendTemplateMail(email, 'application_submitted', { application_token }).catch(() => {});

        return res.json({
            status: true,
            message: `Loan application submitted successfully. Your Application Token is ${application_token}`,
            application_token
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}