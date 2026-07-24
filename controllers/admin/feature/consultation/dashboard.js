import { Consultation } from '../../../../models/Consultation.js';

export async function getDashboard(req, res) {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7 = new Date(todayStart); last7.setDate(last7.getDate() - 6);
        const last30 = new Date(todayStart); last30.setDate(last30.getDate() - 29);

        const [
            total_consultations,
            open_consultations,
            in_progress_consultations,
            pending_consultations,
            resolved_consultations,
            closed_consultations,
            low_count,
            medium_count,
            high_count,
            urgent_count,
            today_consultations,
            last_7_days_consultations,
            last_30_days_consultations
        ] = await Promise.all([
            Consultation.countDocuments(),
            Consultation.countDocuments({ status: 'Open' }),
            Consultation.countDocuments({ status: 'In Progress' }),
            Consultation.countDocuments({ status: 'Pending' }),
            Consultation.countDocuments({ status: 'Resolved' }),
            Consultation.countDocuments({ status: 'Closed' }),
            Consultation.countDocuments({ priority: 'Low' }),
            Consultation.countDocuments({ priority: 'Medium' }),
            Consultation.countDocuments({ priority: 'High' }),
            Consultation.countDocuments({ priority: 'Urgent' }),
            Consultation.countDocuments({ created_at: { $gte: todayStart } }),
            Consultation.countDocuments({ created_at: { $gte: last7 } }),
            Consultation.countDocuments({ created_at: { $gte: last30 } })
        ]);

        return res.json({
            status: true,
            message: 'Dashboard data fetched successfully.',
            data: {
                total_consultations,
                open_consultations,
                in_progress_consultations,
                pending_consultations,
                resolved_consultations,
                closed_consultations,
                today_consultations,
                last_7_days_consultations,
                last_30_days_consultations,
                priority: {
                    low: low_count,
                    medium: medium_count,
                    high: high_count,
                    urgent: urgent_count
                }
            }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}