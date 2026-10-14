
import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { getSummary, getAccounts, getAccountDetails, getPaymentHistory } from '../../controllers/user/accounts/accountsController.js';
const router = express.Router();
router.get('/summary', userAuth, getSummary);
router.get('/index', userAuth, getAccounts);
router.get('/detail', userAuth, getAccountDetails);
router.get('/payment-history', userAuth, getPaymentHistory);
export default router;
