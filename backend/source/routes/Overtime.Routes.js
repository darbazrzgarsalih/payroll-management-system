import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { createOvertime, getAllOvertimes, getSingleOvertime, updateOvertime, voidOvertime } from '../controllers/Overtime.Controller.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.OVERTIME_VIEW), getAllOvertimes)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.OVERTIME_VIEW), getSingleOvertime)
router.post('/', authMiddleware, authorize(PERMISSIONS.OVERTIME_CREATE), createOvertime)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.OVERTIME_UPDATE), updateOvertime)
router.patch('/void/:id', authMiddleware, authorize(PERMISSIONS.OVERTIME_VOID), voidOvertime)

export default router
