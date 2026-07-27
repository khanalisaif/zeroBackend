// user/feature/consultation/routes.js

import express from 'express';
import { createGuestTicket } from '../../controllers/user/feature/consultation/create_guest_ticket.js';
import { createTicket } from '../../controllers/user/feature/consultation/create_ticket.js';
import { getConsultationDetails } from '../../controllers/user/feature/consultation/consultation_details.js';
import { getMyConsultations } from '../../controllers/user/feature/consultation/my_consultations.js';
import { requestTrackConsultation } from '../../controllers/user/feature/consultation/request_track_consultation.js';
import { verifyTrackConsultation } from '../../controllers/user/feature/consultation/verify_track_consultation.js';
import { userAuth } from '../../middlewares/userAuth.js';

const router = express.Router();

// Public routes (Guest ticket creation, OTP tracking, and list by email/ticket_id)
router.post('/create_guest_ticket', createGuestTicket);
router.post('/request_track_consultation', requestTrackConsultation);
router.post('/verify_track_consultation', verifyTrackConsultation);
router.get('/consultation_details', getConsultationDetails);
router.post('/consultation_details', getConsultationDetails);
router.get('/my_consultations', getMyConsultations);
router.post('/my_consultations', getMyConsultations);

// Protected routes (User authenticated)
router.use(userAuth);
router.post('/create_ticket', createTicket);

export default router;
