import { Batch } from '../../../models/Batch.js';

export async function getBatches(req, res) {
    try {
        const batches = await Batch.find().sort({ _id: -1 }).lean();

        const data = batches.map((b, idx) => ({
            batch_no: b._id,
            created_at: b.created_at,
            application_count: b.application_count || 0,
            application_ids: b.application_ids || []
        }));

        return res.json({
            status: true,
            total_batches: data.length,
            data
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}