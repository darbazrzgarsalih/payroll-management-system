import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import { createSalary, deleteSalary, getSalaries, getSingleSalary, updateSalary } from '../controllers/Salary.Controller.js';

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.SALARY_VIEW), getSalaries)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.SALARY_VIEW), getSingleSalary)
router.post('/', authMiddleware, authorize(PERMISSIONS.SALARY_CREATE), createSalary)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.SALARY_UPDATE), updateSalary)
router.delete('/delete/:id', authMiddleware, authorize(PERMISSIONS.SALARY_DELETE), deleteSalary)

export default router