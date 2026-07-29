import { Admin } from '../../../models/Admin.js';
import { User } from '../../../models/User.js';
import { LoanApplication } from '../../../models/LoanApplication.js';
import { Consultation } from '../../../models/Consultation.js';

export async function getMasterDashboard(req, res) {
    try {
        const [totalAdmins, totalUsers, totalApplications, totalConsultations, recentAdmins] = await Promise.all([
            Admin.countDocuments({}),
            User.countDocuments({}),
            LoanApplication.countDocuments({}),
            Consultation.countDocuments({}),
            Admin.find({}).sort({ created_at: -1 }).limit(10).lean()
        ]);

        return res.json({
            status: true,
            message: 'Master Admin dashboard stats fetched successfully',
            data: {
                total_admins: totalAdmins,
                total_users: totalUsers,
                total_applications: totalApplications,
                total_consultations: totalConsultations,
                recent_admins: recentAdmins.map(a => ({
                    id: a._id,
                    name: a.name || 'Admin',
                    email: a.email || '',
                    number: a.number || '',
                    role: a.role || 'admin',
                    created_at: a.created_at || null,
                    last_login_at: a.last_login_at || null
                }))
            }
        });
    } catch (err) {
        console.error('getMasterDashboard error:', err);
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
