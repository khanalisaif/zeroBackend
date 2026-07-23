// user/feature/faq/routes.js

import express from 'express';
import { getFaqList } from '../../controllers/user/feature/faq/get_list.js';

const router = express.Router();

router.get('/get_list', getFaqList);

export default router;


