import express from 'express';
import { PERMISSIONS } from '../role/permissions.js';
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { createDepartment, deleteDepartment, getAllDepartments, getDepartmentById, getSingleDepartment, updateDepartment } from '../controllers/Department.Controller.js';

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.DEPARTMENT_VIEW), getAllDepartments)
router.get('/code/:code', authMiddleware, authorize(PERMISSIONS.DEPARTMENT_VIEW), getSingleDepartment)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.DEPARTMENT_VIEW), getDepartmentById)
router.post('/', authMiddleware, authorize(PERMISSIONS.DEPARTMENT_CREATE), createDepartment)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.DEPARTMENT_UPDATE), updateDepartment)
router.delete('/delete/:id', authMiddleware, authorize(PERMISSIONS.DEPARTMENT_DELETE), deleteDepartment)

export default router