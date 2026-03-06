import express from 'express';
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import {
    upload,
    uploadDocument,
    getEmployeeDocuments,
    downloadDocument,
    deleteDocument,
} from '../controllers/Document.Controller.js';

const router = express.Router();

router.get('/employee/:employeeID', authMiddleware, authorize(PERMISSIONS.DOCUMENT_VIEW), getEmployeeDocuments);
router.post('/', authMiddleware, authorize(PERMISSIONS.DOCUMENT_CREATE), upload.single('file'), uploadDocument);
router.get('/:id/download', authMiddleware, authorize(PERMISSIONS.DOCUMENT_VIEW), downloadDocument);
router.delete('/:id', authMiddleware, authorize(PERMISSIONS.DOCUMENT_DELETE), deleteDocument);

export default router;
