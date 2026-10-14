import express from 'express';

// ── User Modules ──────────────────────────────────────────────────────────────
import userAuthRouter        from './user/authRoutes.js';            // Module 2
import userProfileRouter     from './user/userProfileRoutes.js';     // Module 3 (profile/avatar)
import accountLifecycleRouter from './user/accountLifecycleRoutes.js'; // Module 3 (delete/cancel)
import homeRouter            from './user/homeRoutes.js';            // Module 4
import cibilRouter           from './user/cibilRoutes.js';           // Module 5
import accountsRouter        from './user/accountsRoutes.js';        // Module 6
import reportsRouter         from './user/reportsRoutes.js';         // Module 7
import documentsRouter       from './user/documentsRoutes.js';       // Module 7 (vault)
import loansRouter           from './user/loansRoutes.js';           // Module 8
import offersRouter, { cardsRouter } from './user/offersRoutes.js'; // Module 9
import notificationRouter    from './user/notificationRoutes.js';    // Module 10
import { supportRouter, feedbackRouter } from './user/supportRoutes.js'; // Module 11

// ── Admin Modules ─────────────────────────────────────────────────────────────
import adminAuthRouter    from './admin/authRoutes.js';    // Admin auth (login/logout/profile)
import adminFeatureRouter from './admin/featureRoutes.js'; // Loan apps, docs, consultations, users
import masterAdminRouter  from './admin/masterRoutes.js';  // Master admin (super-admin)
import adminV2Router      from './admin/adminV2Routes.js'; // Module 12 (offers, cards, faqs, support, deletions)

// ─────────────────────────────────────────────────────────────────────────────
const apiRouter = express.Router();

// Module 1: Health Check ─ GET /api/health
apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', app: 'Zero Commission API Node.js', timestamp: new Date().toISOString() });
});

// Module 2: Auth ─ /api/auth/*
apiRouter.use('/auth', userAuthRouter);

// Module 3: User Profile & Account ─ /api/user/*  &  /api/account/*
apiRouter.use('/user',    userProfileRouter);
apiRouter.use('/account', accountLifecycleRouter);

// Module 4: Home & Dashboard ─ /api/home/*  &  /api/activities/*
apiRouter.use('/home',       homeRouter);
apiRouter.use('/activities', homeRouter); // /api/activities/recent → homeRouter.get('/recent')

// Module 5: CIBIL ─ /api/cibil/*
apiRouter.use('/cibil', cibilRouter);

// Module 6: Credit Accounts ─ /api/accounts/*
apiRouter.use('/accounts', accountsRouter);

// Module 7: Credit Reports & Documents Vault
apiRouter.use('/reports',   reportsRouter);   // /api/reports/*
apiRouter.use('/documents', documentsRouter); // /api/documents/*

// Module 8: Loans & Applications ─ /api/loans/*
apiRouter.use('/loans', loansRouter);

// Module 9: Offers & Credit Cards
apiRouter.use('/offers',       offersRouter);  // /api/offers/*
apiRouter.use('/credit-cards', cardsRouter);   // /api/credit-cards/*

// Module 10: Notifications ─ /api/notifications/*
apiRouter.use('/notifications', notificationRouter);

// Module 11: Support, FAQs & Feedback
apiRouter.use('/support',  supportRouter);  // /api/support/*
apiRouter.use('/feedback', feedbackRouter); // /api/feedback/*

// Module 12: Admin Management ─ /api/admin/*
apiRouter.use('/admin', adminV2Router); // Offers CRUD, Cards CRUD, FAQs CRUD, Support settings, Deletions

// Admin Auth ─ /api/admin/auth/*
apiRouter.use('/admin/auth', adminAuthRouter);

// Admin Feature (Loan applications, docs, consultations, users) ─ /api/admin/feature/*
apiRouter.use('/admin/feature', adminFeatureRouter);

// Master Admin (super-admin) ─ /api/admin/master/*
apiRouter.use('/admin/master', masterAdminRouter);

export default apiRouter;
