import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import { applyLeave, approveLeave, getAllLeaves, getEmployeeLeaves, rejectLeave } from '../controllers/Leave.Controller.js';

const router = express.Router()

router.get('/single/:id', authMiddleware, authorize(PERMISSIONS.SELF_VIEW), getEmployeeLeaves)
router.get('/', authMiddleware, authorize(PERMISSIONS.LEAVE_VIEW), getAllLeaves)
router.post('/', authMiddleware, authorize(PERMISSIONS.LEAVE_CREATE), applyLeave)
router.patch('/approve/:id', authMiddleware, authorize(PERMISSIONS.LEAVE_APPROVE), approveLeave)
router.patch('/reject/:id', authMiddleware, authorize(PERMISSIONS.LEAVE_REJECT), rejectLeave)

export default router