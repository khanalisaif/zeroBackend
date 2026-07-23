// user/auth/routes.js — User auth routes

import express from 'express';
import { createUser } from '../../controllers/user/auth/create_user.js';
import { loginWithPassword } from '../../controllers/user/auth/login_with_password.js';
import { sendForgotPasswordOtp } from '../../controllers/user/auth/send_forgot_password_otp.js';
import { sendLoginOtp } from '../../controllers/user/auth/send_login_otp.js';
import { verifyForgotPasswordOtp } from '../../controllers/user/auth/verify_forgot_password_otp.js';
import { verifyLoginOtp } from '../../controllers/user/auth/verify_login_otp.js';
import { setPassword } from '../../controllers/user/auth/set_password.js';
import { userLogout } from '../../controllers/user/auth/user_logout.js';
import { userRefreshToken } from '../../controllers/user/auth/user_refresh_token.js';
import { userAuth } from '../../middlewares/userAuth.js';

const router = express.Router();

router.post('/create_user', createUser);
router.post('/login_with_password', loginWithPassword);
router.post('/send_forgot_password_otp', sendForgotPasswordOtp);
router.post('/send_login_otp', sendLoginOtp);
router.post('/verify_forgot_password_otp', verifyForgotPasswordOtp);
router.post('/verify_login_otp', verifyLoginOtp);
router.post('/refresh_token', userRefreshToken);

// Protected routes
router.post('/set_password', userAuth, setPassword);
router.post('/logout', userAuth, userLogout);

export default router;
