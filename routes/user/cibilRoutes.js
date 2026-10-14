
import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { getScore, refreshScore, getFactors, aiChat, bookConsultation } from '../../controllers/user/cibil/cibilController.js';
const router = express.Router();
router.get('/score', userAuth, getScore);
router.post('/refresh', userAuth, refreshScore);
router.get('/factors', userAuth, getFactors);
router.post('/ai-chat', userAuth, aiChat);
router.post('/consultation', userAuth, bookConsultation);
export default router;
