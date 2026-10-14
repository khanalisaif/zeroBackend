// Module 8: Loans & Applications Routes
// Docs: Module 8.1 - 8.5

import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import {
    checkEligibility,
    getMyApplications,
    getApplicationDetails,
    trackApplication,
    applyLoan
} from '../../controllers/user/loans/loansController.js';

const router = express.Router();

// 8.1 POST /api/loans/check-eligibility (Public/Optional Auth)
router.post('/check-eligibility', checkEligibility);

// 8.2 GET /api/loans/applications (Protected)
router.get('/applications', userAuth, getMyApplications);

// 8.3 GET /api/loans/applications/detail (Protected)
router.get('/applications/detail', userAuth, getApplicationDetails);

// 8.4 GET /api/loans/applications/status (Protected)
router.get('/applications/status', userAuth, trackApplication);

// 8.5 POST /api/loans/apply (Protected)
router.post('/apply', userAuth, applyLoan);

export default router;
