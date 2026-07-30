import { LoanApplication } from '../../../models/LoanApplication.js';
import { LoanApplicationHistory } from '../../../models/LoanApplicationHistory.js';
import { LoanApplicationDocuments } from '../../../models/LoanApplicationDocuments.js';
import { User } from '../../../models/User.js';

export async function getMyApplications(req, res) {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

        const email = (user.email || '').trim();
        const number = (user.number || '').trim();

        const query = [{ user_id: user._id }];
        if (email) query.push({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (number) query.push({ number });

        const apps = await LoanApplication.find({ $or: query }).sort({ _id: -1 }).lean();

        // Automatically link any applications that aren't linked yet
        if (apps.length > 0) {
            const unlinkedIds = apps.filter(a => !a.user_id || a.user_id.toString() !== user._id.toString()).map(a => a._id);
            if (unlinkedIds.length > 0) {
                await LoanApplication.updateMany({ _id: { $in: unlinkedIds } }, { $set: { user_id: user._id } });
            }
            const allAppIds = apps.map(a => a._id.toString());
            await User.updateOne({ _id: user._id }, { $set: { application_ids: JSON.stringify(allAppIds) } });
        }

        for (let app of apps) {
            const history = await LoanApplicationHistory.findOne({ loan_application_id: app._id }).sort({ _id: -1 }).lean();
            app.status = history ? history.status : app.status;
            app.remarks = history ? history.case_history : '';
            app.token = app.application_token || app._id?.toString() || '';
            app.phone = app.number || '';
            let timeline = [];
            try {
                const parsed = history?.case_history ? (typeof history.case_history === 'string' ? JSON.parse(history.case_history) : history.case_history) : null;
                if (Array.isArray(parsed)) timeline = parsed;
            } catch (_) {
                timeline = [];
            }
            app.timeline = timeline;
        }

        return res.json({ status: true, data: apps });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
