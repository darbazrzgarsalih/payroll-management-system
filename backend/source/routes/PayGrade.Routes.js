import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js'
import { createPayGrade, deletePayGrade, getAllPayGrades, updatePayGrade } from '../controllers/PayGrade.Controller.js'
import { authorize } from '../middlewares/Authorize.Middleware.js'
import { PERMISSIONS } from '../role/permissions.js'

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.PAYGRADE_VIEW), getAllPayGrades)
router.post('/', authMiddleware, authorize(PERMISSIONS.PAYGRADE_CREATE), createPayGrade)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.PAYGRADE_UPDATE), updatePayGrade)
router.delete('/delete/:id', authMiddleware, authorize(PERMISSIONS.PAYGRADE_DELETE), deletePayGrade)

export default router