// admin/feature/routes.js — Admin Feature Routes

import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';

// FAQ routes
import faqRouter from './faqRoutes.js';

// Loan application routes
import { getLoanApplications } from '../../controllers/admin/feature/get_loan_applications.js';
import { getAllLoanApplications } from '../../controllers/admin/feature/get_all_loan_applications.js';
import { openApplication } from '../../controllers/admin/feature/open_application.js';
import { updateLoanStatus } from '../../controllers/admin/feature/update_laon_status.js';
import { deleteLoanApplication } from '../../controllers/admin/feature/delete_loan_application.js';
import { updateDocumentStatus } from '../../controllers/admin/feature/update_document_status.js';
import { getDocumentDetails } from '../../controllers/admin/feature/get_document_details.js';
import { getBatches } from '../../controllers/admin/feature/get_batches.js';
import { exportApplication } from '../../controllers/admin/feature/export_application.js';

// Consultation and Contact
import consultationRouter from './consultationRoutes.js';
import contactRouter from './contactRoutes.js';
import userManagementRouter from './userManagementRoutes.js';

const router = express.Router();

// FAQ
router.use('/faq', faqRouter);

// Consultation
router.use('/consultation', consultationRouter);

// Contact
router.use('/contact', contactRouter);

// Users Management
router.use('/users', userManagementRouter);

// Loan Applications
router.post('/get_loan_applications', adminAuth, getLoanApplications);
router.post('/get_all_loan_applications', adminAuth, getAllLoanApplications);
router.get('/open_application', adminAuth, openApplication);
router.post('/update_laon_status', adminAuth, updateLoanStatus);
router.post('/delete_loan_application', adminAuth, deleteLoanApplication);
router.post('/update_document_status', adminAuth, updateDocumentStatus);
router.post('/get_document_details', adminAuth, getDocumentDetails);
router.get('/get_batches', adminAuth, getBatches);
router.post('/export_application', adminAuth, exportApplication);

export default router;
