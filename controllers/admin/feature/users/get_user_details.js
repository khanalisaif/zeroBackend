import { User } from '../../../../models/User.js';
import { LoanApplication } from '../../../../models/LoanApplication.js';
import { Consultation } from '../../../../models/Consultation.js';

export async function getUserDetails(req, res) {
    try {
        const id = req.query.id || req.body.id || '';
        if (!id) {
            return res.status(400).json({ status: false, message: 'User ID is required' });
        }

        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const appQuery = [];
        if (user._id) appQuery.push({ user_id: user._id });
        if (user.email) appQuery.push({ email: user.email });
        if (user.number) appQuery.push({ number: user.number });

        const consQuery = [];
        if (user._id) consQuery.push({ user_id: user._id });
        if (user.email) consQuery.push({ email: user.email });
        if (user.number) consQuery.push({ phone_number: user.number });

        const [loanApplications, consultations] = await Promise.all([
            appQuery.length > 0 ? LoanApplication.find({ $or: appQuery }).sort({ created_at: -1 }).lean() : [],
            consQuery.length > 0 ? Consultation.find({ $or: consQuery }).sort({ created_at: -1 }).lean() : []
        ]);

        return res.json({
            status: true,
            message: 'User details fetched successfully',
            data: {
                user: {
                    id: user._id,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    name: user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User',
                    email: user.email || '',
                    number: user.number || '',
                    pan_number: user.pan_number || null,
                    account_status: user.account_status || 'active',
                    profile_pic: user.profile_pic || null,
                    created_at: user.created_at || null,
                    last_login_at: user.last_login_at || null
                },
                loan_applications: loanApplications,
                consultations: consultations
            }
        });
    } catch (err) {
        console.error('getUserDetails error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
