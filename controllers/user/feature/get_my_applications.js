import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';

export async function getMyApplications(req, res) {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

        const email = user.email || '';
        const number = user.number || '';

        if (!email && !number) {
            return res.json({ status: true, data: [] });
        }

        const query = [];
        if (email) query.push({ email });
        if (number) query.push({ number });

        const apps = await LoanApplication.find({ $or: query }).sort({ _id: -1 }).lean();

        for (let app of apps) {
            const history = await LoanApplicationHistory.findOne({ loan_application_id: app._id }).sort({ _id: -1 }).lean();
            app.status = history ? history.status : app.status;
            app.remarks = history ? history.case_history : '';
        }

        return res.json({ status: true, data: apps });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
