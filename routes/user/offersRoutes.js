
import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { getOffers, getOfferDetail, getCardOffers, verifyPan, verifyPanOtp, applyCard } from '../../controllers/user/offers/offersController.js';
const router = express.Router();
router.get('/index', getOffers);
router.get('/detail', getOfferDetail);
export const cardsRouter = express.Router();
cardsRouter.get('/offers', getCardOffers);
cardsRouter.post('/verify-pan', userAuth, verifyPan);
cardsRouter.post('/verify-pan-otp', userAuth, verifyPanOtp);
cardsRouter.post('/apply', userAuth, applyCard);
export default router;
