// Module 12: Admin Management Routes
// Docs: Module 12.1 - 12.8

import express from 'express';
import { adminAuth } from '../../middlewares/adminAuth.js';
import { 
    getAdminOffers, createAdminOffer, updateAdminOffer, deleteAdminOffer,
    getAdminCards, createAdminCard, updateAdminCard, deleteAdminCard,
    getAdminFaqs, createAdminFaq, updateAdminFaq, deleteAdminFaq,
    getAdminSupport, updateAdminSupport,
    getAccountDeletions, processAccountDeletions, cancelAccountDeletion
} from '../../controllers/admin/adminController.js';

const router = express.Router();

// Require admin authentication (X-Admin-Key or Bearer token)
router.use(adminAuth);

// 12.1 - 12.4 Offers CRUD
router.get('/offers/index', getAdminOffers);
router.post('/offers/create', createAdminOffer);
router.post('/offers/update', updateAdminOffer);
router.put('/offers/update', updateAdminOffer);
router.post('/offers/delete', deleteAdminOffer);
router.delete('/offers/delete', deleteAdminOffer);

// 12.5 Cards CRUD
router.get('/credit-cards/index', getAdminCards);
router.post('/credit-cards/create', createAdminCard);
router.post('/credit-cards/update', updateAdminCard);
router.put('/credit-cards/update', updateAdminCard);
router.post('/credit-cards/delete', deleteAdminCard);
router.delete('/credit-cards/delete', deleteAdminCard);

// 12.6 FAQs CRUD
router.get('/faqs/index', getAdminFaqs);
router.post('/faqs/create', createAdminFaq);
router.post('/faqs/update', updateAdminFaq);
router.put('/faqs/update', updateAdminFaq);
router.post('/faqs/delete', deleteAdminFaq);
router.delete('/faqs/delete', deleteAdminFaq);

// 12.7 Support Settings
router.get('/support/index', getAdminSupport);
router.post('/support/index', updateAdminSupport);
router.put('/support/index', updateAdminSupport);

// 12.8 Account Deletions
router.get('/account-deletions/index', getAccountDeletions);
router.post('/account-deletions/process', processAccountDeletions);
router.post('/account-deletions/cancel', cancelAccountDeletion);

export default router;
