import { ContactRequest } from '../../../../models/ContactRequest.js';
import { sendTemplateMail } from '../../../../services/email/mail_helper.js';

/**
 * Get all contact requests (for Admin Panel)
 */
export async function getContactList(req, res) {
    try {
        const list = await ContactRequest.find({}).sort({ _id: -1 }).lean();
        return res.json({ status: true, data: list });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}

/**
 * Update status and admin remarks of a contact request
 */
export async function updateContactRequest(req, res) {
    try {
        const id = (req.body.id || req.query.id || '').trim();
        const status = (req.body.status || req.query.status || '').trim();
        const remarks = (req.body.remarks || req.query.remarks || '').trim();
        const silent = req.body.silent === true || req.body.silent === 'true' || req.query.silent === 'true';

        if (!id || !status) {
            return res.json({ status: false, message: 'Missing fields: id and status are required' });
        }

        const contact = await ContactRequest.findById(id);
        if (!contact) {
            return res.json({ status: false, message: 'Contact request not found' });
        }

        const updates = { status, remarks };
        await ContactRequest.updateOne({ _id: contact._id }, updates);

        if (!silent && contact.email) {
            sendTemplateMail(contact.email, 'contact_update', {
                name: contact.full_name,
                status,
                remarks
            }).catch(() => {});
        }

        return res.json({ status: true, message: 'Contact request updated successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}

/**
 * Permanently delete a contact request
 */
export async function deleteContactRequest(req, res) {
    try {
        const id = (req.body.id || req.query.id || '').trim();
        if (!id) {
            return res.json({ status: false, message: 'id is required' });
        }

        const contact = await ContactRequest.findById(id);
        if (!contact) {
            return res.json({ status: false, message: 'Contact request not found' });
        }

        await ContactRequest.deleteOne({ _id: contact._id });

        return res.json({ status: true, message: 'Contact request deleted successfully' });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}
