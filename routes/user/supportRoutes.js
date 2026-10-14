// Module 11: Support, FAQs & App Feedback routes
// Docs: /api/support/* and /api/feedback/*

import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import {
    getSupportInfo,
    getFaqs,
    submitQuery,
    getFeedback,
    submitFeedback
} from '../../controllers/user/support/supportController.js';

// ── Support ─ /api/support/*
export const supportRouter = express.Router();
supportRouter.get('/index', getSupportInfo);   // 11.1 GET /api/support/index
supportRouter.get('/faqs',  getFaqs);          // 11.2 GET /api/support/faqs
supportRouter.post('/query', submitQuery);     // 11.3 POST /api/support/query

// ── Feedback ─ /api/feedback/*
export const feedbackRouter = express.Router();
feedbackRouter.get('/index',  userAuth, getFeedback);     // 11.4 GET /api/feedback/index
feedbackRouter.post('/index', userAuth, submitFeedback);  // 11.5 POST /api/feedback/index
