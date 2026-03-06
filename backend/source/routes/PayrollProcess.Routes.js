import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import { approvePayroll, createPayrollRun, exportPayrollCSV, generatePayrollItems, getAllPayrolls, getPayrollSummary, markPayrollAsPaid, rejectPayroll, getLiabilityReport } from '../controllers/PayrollProcess.Controller.js';

const router = express.Router()

router.get('/liability-report', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), getLiabilityReport)
router.get('/', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), getAllPayrolls)

router.get('/export', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), exportPayrollCSV)
router.get('/:id/summary', authMiddleware, authorize(PERMISSIONS.PAYROLL_VIEW), getPayrollSummary)
router.post('/run', authMiddleware, authorize(PERMISSIONS.PAYROLL_RUN), createPayrollRun)
router.post('/generate/:id', authMiddleware, authorize(PERMISSIONS.PAYROLL_RUN), generatePayrollItems)
router.post('/approve/:id', authMiddleware, authorize(PERMISSIONS.PAYROLL_APPROVE), approvePayroll)
router.post('/pay/:id', authMiddleware, authorize(PERMISSIONS.PAYROLL_FINALIZE), markPayrollAsPaid)
router.post('/reject/:id', authMiddleware, authorize(PERMISSIONS.PAYROLL_REJECT), rejectPayroll)
router.delete('/delete/:id', authMiddleware, authorize(PERMISSIONS.PAYROLL_REJECT))

export default router