// user/feature/contact/routes.js

import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { createContact } from '../../controllers/user/feature/contact/contact.js';

const router = express.Router();

router.use(userAuth);
router.post('/submit', createContact);

export default router;
