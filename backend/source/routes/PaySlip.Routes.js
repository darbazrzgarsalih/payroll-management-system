import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import {
    generatePaySlipsForPayroll,
    getAllPayslips,
    getMyPayslips,
    getPayslipById,
    updatePayslipStatus,
    downloadPayslipPDF,
    getJobStatus,
    bulkUpdateStatus,
    createAdjustmentPayslip,
    getEligiblePayrolls,
} from '../controllers/PaySlip.Controller.js';
import { PERMISSIONS } from '../role/permissions.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';

const router = express.Router()


router.get('/eligible-payrolls', authMiddleware, getEligiblePayrolls)


router.get('/', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), getAllPayslips)
router.post('/generate/:payrollID', authMiddleware, authorize(PERMISSIONS.PAYROLL_CREATE), generatePaySlipsForPayroll)
router.get('/job/:jobId', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), getJobStatus)
router.post('/bulk-status', authMiddleware, authorize(PERMISSIONS.PAYROLL_UPDATE), bulkUpdateStatus)
router.post('/adjustment', authMiddleware, authorize(PERMISSIONS.PAYROLL_CREATE), createAdjustmentPayslip)


router.get('/my', authMiddleware, getMyPayslips)


router.get('/:id', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), getPayslipById)
router.patch('/:id/status', authMiddleware, authorize(PERMISSIONS.PAYROLL_UPDATE), updatePayslipStatus)
router.get('/:id/pdf', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), downloadPayslipPDF)

export default router