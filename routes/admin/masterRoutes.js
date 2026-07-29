import express from 'express';
import { masterAdminLogin } from '../../controllers/admin/master/master_login.js';
import { masterSendOtp } from '../../controllers/admin/master/master_send_otp.js';
import { masterVerifyOtp } from '../../controllers/admin/master/master_verify_otp.js';
import { getMasterDashboard } from '../../controllers/admin/master/master_dashboard.js';
import { getAdminsList } from '../../controllers/admin/master/get_admins.js';
import { createNewAdmin } from '../../controllers/admin/master/create_admin.js';
import { deleteAdminAccount } from '../../controllers/admin/master/delete_admin.js';
import { updateAdminPermissions } from '../../controllers/admin/master/update_permissions.js';
import { masterAdminAuth } from '../../middlewares/masterAdminAuth.js';

const router = express.Router();

// Publicly accessible master login endpoints
router.post('/login', masterAdminLogin);
router.post('/send_otp', masterSendOtp);
router.post('/verify_otp', masterVerifyOtp);


// Protected master admin endpoints
router.get('/dashboard', masterAdminAuth, getMasterDashboard);
router.get('/admins/list', masterAdminAuth, getAdminsList);
router.post('/admins/create', masterAdminAuth, createNewAdmin);
router.post('/admins/delete', masterAdminAuth, deleteAdminAccount);
router.post('/admins/permissions', masterAdminAuth, updateAdminPermissions);

export default router;

