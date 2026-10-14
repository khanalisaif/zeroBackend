// Module 7: Credit Reports routes
// Docs: GET /api/reports/* endpoints

import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import {
    getLatestReport,
    getEnquiries,
    getDownloadUrl,
    streamReportFile,
    unlockReport
} from '../../controllers/user/reports/reportsController.js';

const router = express.Router();

router.get('/latest',    userAuth, getLatestReport);   // 7.1
router.get('/enquiries', userAuth, getEnquiries);      // 7.2
router.get('/download',  userAuth, getDownloadUrl);    // 7.3
router.get('/file',               streamReportFile);   // 7.4 — public (uses token in query)
router.post('/unlock',   userAuth, unlockReport);      // 7.5

export default router;
