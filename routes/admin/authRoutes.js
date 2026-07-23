// admin/auth/routes.js — Admin Auth Routes

import express from 'express';
import { loginWithPassword } from '../../controllers/admin/auth/login_with_password.js';
import { sendLoginOtp } from '../../controllers/admin/auth/send_login_otp.js';
import { verifyLoginOtp } from '../../controllers/admin/auth/verify_login_otp.js';
import { adminLogout } from '../../controllers/admin/auth/admin_logout.js';
import { adminRefreshToken } from '../../controllers/admin/auth/admin_refresh_token.js';
import { createAdmin } from '../../controllers/admin/auth/create_admin.js';
import { adminAuth } from '../../middlewares/adminAuth.js';

const router = express.Router();

router.post('/login_with_password', loginWithPassword);
router.post('/send_login_otp', sendLoginOtp);
router.post('/verify_login_otp', verifyLoginOtp);
router.post('/logout', adminAuth, adminLogout);
router.post('/refresh_token', adminRefreshToken);
router.post('/create_admin', createAdmin);

export default router;
