
import express from 'express';
import { userAuth } from '../../middlewares/userAuth.js';
import { getDocuments, uploadDocument, deleteDocument } from '../../controllers/user/documents/documentsController.js';
const router = express.Router();
router.get('/index', userAuth, getDocuments);
router.post('/upload', userAuth, uploadDocument);
router.delete('/delete', userAuth, deleteDocument);
router.post('/delete', userAuth, deleteDocument);
export default router;
