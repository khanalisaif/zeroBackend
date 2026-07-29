import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';
import { getUsers } from '../../controllers/admin/feature/users/get_users.js';
import { getUserDetails } from '../../controllers/admin/feature/users/get_user_details.js';
import { deleteUser } from '../../controllers/admin/feature/users/delete_user.js';

const router = express.Router();

router.use(adminAuth);

router.get('/list', getUsers);
router.get('/details', getUserDetails);
router.post('/delete', deleteUser);

export default router;
