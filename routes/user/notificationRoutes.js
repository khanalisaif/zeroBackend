import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { getNotifications, markNotificationsRead, getNotificationSettings, updateNotificationSettings } from '../../controllers/user/notifications/notificationController.js';

const router = express.Router();

router.get('/index', userAuth, getNotifications);
router.put('/read', userAuth, markNotificationsRead);
router.post('/read', userAuth, markNotificationsRead); // Support both PUT and POST as per doc
router.get('/settings', userAuth, getNotificationSettings);
router.put('/settings', userAuth, updateNotificationSettings);
router.post('/settings', userAuth, updateNotificationSettings);

export default router;
