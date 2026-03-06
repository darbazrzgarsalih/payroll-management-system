import express from 'express';
import { createEmployee, deleteEmployee, getAllEmployees, getEmployeeByCode, getEmployeeProfile, getSingleEmployee, terminateEmployee, updateEmployee, importEmployeesCSV } from '../controllers/Employee.Controller.js';
import multer from 'multer';
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVATAR_DIR = path.join(__dirname, '..', '..', 'documents', 'employees');
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storageAvatar = multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `emp_avatar_${Date.now()}${ext}`);
    }
});

const uploadAvatar = multer({
    storage: storageAvatar,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Invalid file type for avatar'));
    }
});

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_VIEW), getAllEmployees)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_VIEW), getSingleEmployee)
router.get('/profile', authMiddleware, authorize(PERMISSIONS.SELF_VIEW), getEmployeeProfile)
router.get('/code/:code', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_VIEW), getEmployeeByCode)
router.post('/create', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_CREATE), uploadAvatar.single('avatar'), createEmployee)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_UPDATE), uploadAvatar.single('avatar'), updateEmployee)
router.patch('/terminate/:id', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_UPDATE), terminateEmployee)
router.delete('/delete/:id', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_DELETE), deleteEmployee)

const upload = multer({ storage: multer.memoryStorage() });
router.post('/import', authMiddleware, authorize(PERMISSIONS.EMPLOYEE_CREATE), upload.single('csv'), importEmployeesCSV);


export default router