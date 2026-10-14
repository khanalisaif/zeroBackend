import express from 'express';
import { updateProfile, getProfile, updateAvatar } from '../../controllers/user/auth/update_profile.js';
import { userAuth } from '../../middlewares/userAuth.js';

const router = express.Router();

router.get('/profile', userAuth, getProfile);
router.put('/profile', userAuth, updateProfile);
router.post('/profile', userAuth, updateProfile);
router.post('/avatar', userAuth, updateAvatar);

// Add these to match document later if needed:
// router.get('/verification-status', userAuth, getVerificationStatus);
// router.post('/bank-details', userAuth, addBankDetails);
// router.get('/bank-details', userAuth, getBankDetails);

export default router;
