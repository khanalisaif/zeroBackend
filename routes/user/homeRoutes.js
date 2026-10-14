import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { getDashboard, getRecentActivities } from '../../controllers/user/home/homeController.js';

const router = express.Router();

// 4.1 GET /api/home/dashboard
router.get('/dashboard', userAuth, getDashboard);

// 4.2 GET /api/activities/recent (mounted via /activities prefix in apiRoutes.js)
router.get('/recent', userAuth, getRecentActivities);

export default router;
