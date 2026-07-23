// admin/feature/consultation/routes.js — Consultation routes

import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';
import { getDashboard } from '../../controllers/admin/feature/consultation/dashboard.js';
import { getTicketList } from '../../controllers/admin/feature/consultation/ticket_list.js';
import { updateConsultation } from '../../controllers/admin/feature/consultation/update_consultation.js';
import { getConsultationDetails } from '../../controllers/admin/feature/consultation/consultation_details.js';

const router = express.Router();

router.use(adminAuth);

router.get('/dashboard', getDashboard);
router.get('/ticket_list', getTicketList);
router.post('/update_consultation', updateConsultation);
router.get('/consultation_details', getConsultationDetails);

export default router;
