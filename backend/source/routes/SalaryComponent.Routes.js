import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js'
import { authorize } from '../middlewares/Authorize.Middleware.js'
import { PERMISSIONS } from '../role/permissions.js'
import { createSalaryComponent, deactivateSalaryComponent, getAllSalaryComponents, updateSalaryComponent } from '../controllers/SalaryComponent.Controller.js'


const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.SALARYCOMPONENT_VIEW), getAllSalaryComponents)
router.post('/', authMiddleware, authorize(PERMISSIONS.SALARYCOMPONENT_CREATE), createSalaryComponent)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.SALARYCOMPONENT_UPDATE), updateSalaryComponent)
router.patch('/deactivate/:id', authMiddleware, authorize(PERMISSIONS.SALARYCOMPONENT_DELETE), deactivateSalaryComponent)


export default router