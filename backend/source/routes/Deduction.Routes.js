import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { createDeduction, getAllDeductions, getSingleDeduction, updateDeduction, voidDeduction } from '../controllers/Deduction.Controller.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.DEDUCTION_VIEW), getAllDeductions);
router.get('/:id', authMiddleware, authorize(PERMISSIONS.DEDUCTION_VIEW), getSingleDeduction);
router.post('/', authMiddleware, authorize(PERMISSIONS.DEDUCTION_CREATE), createDeduction);
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.DEDUCTION_UPDATE), updateDeduction);
router.patch('/void/:id', authMiddleware, authorize(PERMISSIONS.DEDUCTION_VOID), voidDeduction);

export default router