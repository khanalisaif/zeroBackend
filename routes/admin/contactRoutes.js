// admin/feature/contact/routes.js — Contact routes

import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';
import {
    getContactList,
    updateContactRequest,
    deleteContactRequest
} from '../../controllers/admin/feature/contact/contact_requests.js';

const router = express.Router();

router.use(adminAuth);

router.get('/list', getContactList);
router.post('/update', updateContactRequest);
router.post('/delete', deleteContactRequest);

export default router;
