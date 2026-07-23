// admin/feature/faq/routes.js — FAQ routes

import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';
import { addFaq } from '../../controllers/admin/feature/faq/add_faq.js';
import { bulkAddFaq } from '../../controllers/admin/feature/faq/bulk_add_faq.js';
import { deleteFaq } from '../../controllers/admin/feature/faq/delete_faq.js';
import { updateFaq } from '../../controllers/admin/feature/faq/update_faq.js';

const router = express.Router();

router.use(adminAuth);

router.post('/add_faq', addFaq);
router.post('/bulk_add_faq', bulkAddFaq);
router.post('/delete_faq', deleteFaq);
router.post('/update_faq', updateFaq);

export default router;
