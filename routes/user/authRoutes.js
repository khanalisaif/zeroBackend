// user/auth/routes.js — User auth routes

import express from 'express';
import { createUser } from '../../controllers/user/auth/create_user.js';
import { verifyRegistration } from '../../controllers/user/auth/verify_registration.js';
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

// Exact paths from API documentation
router.post('/register', createUser);                          // 2.1 Register
router.post('/verify-registration', verifyRegistration);       // 2.2 Verify OTP (dedicated controller)
router.post('/login', loginWithPassword);
router.post('/login-with-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/verify-account', sendForgotPasswordOtp);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/forgot-password', setPassword);
router.post('/refresh-token', userRefreshToken);
router.post('/logout', userAuth, userLogout);

export default router;
