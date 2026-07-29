import { User } from '../../../../models/User.js';
import { LoanApplication } from '../../../../models/LoanApplication.js';
import { Consultation } from '../../../../models/Consultation.js';

export async function getUsers(req, res) {
    try {
        const users = await User.find({}).sort({ created_at: -1 }).lean();

        const enrichedUsers = await Promise.all(
            users.map(async (u) => {
                const appQuery = [];
                if (u._id) appQuery.push({ user_id: u._id });
                if (u.email) appQuery.push({ email: u.email });
                if (u.number) appQuery.push({ number: u.number });

                const consQuery = [];
                if (u._id) consQuery.push({ user_id: u._id });
                if (u.email) consQuery.push({ email: u.email });
                if (u.number) consQuery.push({ phone_number: u.number });

                const applications_count = appQuery.length > 0
                    ? await LoanApplication.countDocuments({ $or: appQuery })
                    : 0;

                const consultations_count = consQuery.length > 0
                    ? await Consultation.countDocuments({ $or: consQuery })
                    : 0;

                return {
                    id: u._id,
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'User',
                    email: u.email || '',
                    number: u.number || '',
                    pan_number: u.pan_number || null,
                    account_status: u.account_status || 'active',
                    profile_pic: u.profile_pic || null,
                    created_at: u.created_at || null,
                    last_login_at: u.last_login_at || null,
                    applications_count,
                    consultations_count
                };
            })
        );

        return res.json({
            status: true,
            message: 'Users fetched successfully',
            data: enrichedUsers
        });
    } catch (err) {
        console.error('getUsers error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
