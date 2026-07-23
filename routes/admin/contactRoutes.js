// admin/feature/contact/routes.js — Contact routes

import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';
import { getContactList } from '../../controllers/admin/feature/contact/list.js';

const router = express.Router();

router.use(adminAuth);

router.get('/list', getContactList);

export default router;
