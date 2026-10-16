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
router.get('/offers', getAdminOffers);
router.post('/offers/create', createAdminOffer);
router.post('/offers', createAdminOffer);
router.post('/offers/update', updateAdminOffer);
router.put('/offers/update', updateAdminOffer);
router.put('/offers', updateAdminOffer);
router.post('/offers/delete', deleteAdminOffer);
router.delete('/offers/delete', deleteAdminOffer);
router.delete('/offers', deleteAdminOffer);

// 12.5 Cards CRUD (Supports both /credit-cards and /cards)
router.get('/credit-cards/index', getAdminCards);
router.get('/credit-cards', getAdminCards);
router.get('/cards/index', getAdminCards);
router.get('/cards', getAdminCards);

router.post('/credit-cards/create', createAdminCard);
router.post('/credit-cards', createAdminCard);
router.post('/cards/create', createAdminCard);
router.post('/cards', createAdminCard);

router.post('/credit-cards/update', updateAdminCard);
router.put('/credit-cards/update', updateAdminCard);
router.put('/credit-cards', updateAdminCard);
router.post('/cards/update', updateAdminCard);
router.put('/cards/update', updateAdminCard);
router.put('/cards', updateAdminCard);

router.post('/credit-cards/delete', deleteAdminCard);
router.delete('/credit-cards/delete', deleteAdminCard);
router.delete('/credit-cards', deleteAdminCard);
router.post('/cards/delete', deleteAdminCard);
router.delete('/cards/delete', deleteAdminCard);
router.delete('/cards', deleteAdminCard);

// 12.6 FAQs CRUD
router.get('/faqs/index', getAdminFaqs);
router.get('/faqs', getAdminFaqs);
router.post('/faqs/create', createAdminFaq);
router.post('/faqs', createAdminFaq);
router.post('/faqs/update', updateAdminFaq);
router.put('/faqs/update', updateAdminFaq);
router.put('/faqs', updateAdminFaq);
router.post('/faqs/delete', deleteAdminFaq);
router.delete('/faqs/delete', deleteAdminFaq);
router.delete('/faqs', deleteAdminFaq);

// 12.7 Support Settings
router.get('/support/index', getAdminSupport);
router.get('/support', getAdminSupport);
router.post('/support/index', updateAdminSupport);
router.put('/support/index', updateAdminSupport);
router.post('/support', updateAdminSupport);
router.put('/support', updateAdminSupport);

// 12.8 Account Deletions (Supports both /account-deletions and /deletions)
router.get('/account-deletions/index', getAccountDeletions);
router.get('/account-deletions', getAccountDeletions);
router.get('/deletions/index', getAccountDeletions);
router.get('/deletions', getAccountDeletions);

router.post('/account-deletions/process', processAccountDeletions);
router.post('/deletions/process', processAccountDeletions);
router.post('/account-deletions/cancel', cancelAccountDeletion);
router.post('/deletions/cancel', cancelAccountDeletion);

export default router;
