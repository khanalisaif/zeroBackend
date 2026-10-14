// admin/feature/routes.js — Admin Feature Routes

import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';

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

// Consultation
router.use('/consultation', consultationRouter);

// Contact
router.use('/contact', contactRouter);

// Users Management
router.use('/users', userManagementRouter);

// Loan Applications
router.get('/loan-applications', adminAuth, getLoanApplications);
router.get('/loan-applications/all', adminAuth, getAllLoanApplications);
router.get('/loan-applications/open', adminAuth, openApplication);
router.post('/loan-applications/update-status', adminAuth, updateLoanStatus);
router.post('/loan-applications/delete', adminAuth, deleteLoanApplication);
router.post('/documents/update-status', adminAuth, updateDocumentStatus);
router.get('/documents/details', adminAuth, getDocumentDetails);
router.get('/batches', adminAuth, getBatches);
router.post('/loan-applications/export', adminAuth, exportApplication);

export default router;
