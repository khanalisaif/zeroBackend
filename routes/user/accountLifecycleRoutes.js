import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { requestDeletion, getDeletionStatus, cancelDeletion } from '../../controllers/user/account/accountLifecycle.js';

const router = express.Router();

router.post('/delete-request', userAuth, requestDeletion);
router.get('/delete-request', userAuth, getDeletionStatus);
router.post('/cancel-delete-request', userAuth, cancelDeletion);

export default router;
