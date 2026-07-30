// user/feature/routes.js — User feature routes

import express from 'express';
import multer from 'multer';
import { applyLoan } from '../../controllers/user/feature/apply_loan.js';
import { getApplicationDetails } from '../../controllers/user/feature/get_application_details.js';
import { refreshApplication } from '../../controllers/user/feature/refresh_application.js';
import { requestTrackApplication } from '../../controllers/user/feature/request_track_application.js';
import { trackApplication } from '../../controllers/user/feature/track_application.js';
import { uploadDocs } from '../../controllers/user/feature/upload_docs.js';
import { verifyOtp } from '../../controllers/user/feature/verify_otp.js';
import { getMyApplications } from '../../controllers/user/feature/get_my_applications.js';
import { getMyConsultations } from '../../controllers/user/feature/get_my_consultations.js';
import { userAuth } from '../../middlewares/userAuth.js';
import fs from 'fs';

// Sub-feature routes
import faqRoutes from './faqRoutes.js';
import contactRoutes from './contactRoutes.js';
import consultationRoutes from './consultationRoutes.js';

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });
const multiUpload = upload.fields([
    { name: 'pancard', maxCount: 1 },
    { name: 'adharcard', maxCount: 1 },
    { name: 'salary_slips', maxCount: 1 },
    { name: 'bank_statement', maxCount: 1 },
    { name: 'employment_letter', maxCount: 1 },
    { name: 'business_registration', maxCount: 1 },
    { name: 'gst_returns', maxCount: 1 },
    { name: 'moa', maxCount: 1 },
    { name: 'otherdocs', maxCount: 5 }
]);

router.post('/apply_loan', applyLoan);
router.post('/get_application_details', getApplicationDetails);
router.post('/refresh_application', refreshApplication);
router.post('/request_track_application', requestTrackApplication);
router.post('/track_application', trackApplication);
router.post('/verify_otp', verifyOtp);

// Document upload (accessible to both guest loan applicants via token and logged in users)
router.post('/upload_docs', multiUpload, uploadDocs);
router.get('/get_my_applications', userAuth, getMyApplications);
router.get('/get_my_consultations', userAuth, getMyConsultations);

// Sub-features
router.use('/faq', faqRoutes);
router.use('/contact', contactRoutes);
router.use('/consultation', consultationRoutes);

export default router;
