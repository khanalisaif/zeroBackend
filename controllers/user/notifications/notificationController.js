import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import { Notification } from '../../../models/Notification.js';

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user._id }).sort({ created_at: -1 });
        const unread_count = notifications.filter(n => n.is_unread).length;
        return sendSuccess(res, 200, 'Notifications retrieved.', { unread_count, notifications });
    } catch(err) { return sendError(res, 500, err.message); }
};

export const markNotificationsRead = async (req, res) => {
    try {
        if (req.body.all) {
            await Notification.updateMany({ user_id: req.user._id }, { is_unread: false });
            return sendSuccess(res, 200, 'Notification(s) marked as read.', { affected: 'all', unread_count: 0 });
        } else if (req.body.id) {
            await Notification.findByIdAndUpdate(req.body.id, { is_unread: false });
            const unread = await Notification.countDocuments({ user_id: req.user._id, is_unread: true });
            return sendSuccess(res, 200, 'Notification(s) marked as read.', { affected: req.body.id, unread_count: unread });
        }
        return sendError(res, 422, 'Invalid payload');
    } catch(err) { return sendError(res, 500, err.message); }
};

export const getNotificationSettings = async (req, res) => {
    try {
        // Since settings are usually part of User model, or we can mock it as requested by doc if it's not present
        const settings = req.user.notification_settings || {
            push_enabled: true,
            email_alerts: false,
            loan_updates: true,
            offers_promo: false,
            report_alerts: true
        };
        return sendSuccess(res, 200, 'Notification settings retrieved successfully.', settings);
    } catch(err) { return sendError(res, 500, err.message); }
};

export const updateNotificationSettings = async (req, res) => {
    try {
        req.user.notification_settings = { ...req.user.notification_settings, ...req.body };
        await req.user.save();
        return sendSuccess(res, 200, 'Notification settings updated successfully.', req.user.notification_settings);
    } catch(err) { return sendError(res, 500, err.message); }
};
