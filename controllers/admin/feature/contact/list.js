import { ContactRequest } from '../../../../models/ContactRequest.js';
export async function getContactList(req, res) {
    try {
        const list = await ContactRequest.find({}).sort({ _id: -1 }).lean();
        return res.json({ status: true, data: list });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}