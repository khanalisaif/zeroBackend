// user/feature/consultation/routes.js

import express from 'express';
import { createGuestTicket } from '../../controllers/user/feature/consultation/create_guest_ticket.js';
import { createTicket } from '../../controllers/user/feature/consultation/create_ticket.js';
import { getConsultationDetails } from '../../controllers/user/feature/consultation/consultation_details.js';
import { getMyConsultations } from '../../controllers/user/feature/consultation/my_consultations.js';
import { userAuth } from '../../middlewares/userAuth.js';

const router = express.Router();

router.post('/create_guest_ticket', createGuestTicket);

// Protected routes
router.use(userAuth);
router.post('/create_ticket', createTicket);
router.get('/consultation_details', getConsultationDetails);
router.get('/my_consultations', getMyConsultations);

export default router;
