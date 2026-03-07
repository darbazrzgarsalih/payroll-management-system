import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js'
import { authorize } from '../middlewares/Authorize.Middleware.js'
import { PERMISSIONS } from '../role/permissions.js'
import { createLeaveType, deactivateLeaveType, getAllLeaveTypes, getSingleLeaveType, updateLeaveType } from '../controllers/LeaveType.Controller.js';

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.LEAVETYPE_VIEW), getAllLeaveTypes)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.LEAVE_VIEW), getSingleLeaveType)
router.post('/', authMiddleware, authorize(PERMISSIONS.LEAVE_CREATE), createLeaveType)
router.patch('/deactivate/:id', authMiddleware, authorize(PERMISSIONS.LEAVE_REJECT), deactivateLeaveType)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.LEAVETYPE_UPDATE), updateLeaveType)

export default router