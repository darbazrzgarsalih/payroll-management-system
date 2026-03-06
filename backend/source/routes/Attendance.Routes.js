import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js'
import { authorize } from '../middlewares/Authorize.Middleware.js'
import { PERMISSIONS } from '../role/permissions.js'
import { checkIn, checkOut, getAttendanceReport, getMyAttendance, updateAttendance, exportAttendanceCSV, importAttendanceCSV } from '../controllers/Attendance.Controller.js';
import multer from 'multer';

const router = express.Router()

router.get('/report', authMiddleware, authorize(PERMISSIONS.ATTENDANCE_VIEW), getAttendanceReport)
router.get('/export', authMiddleware, authorize(PERMISSIONS.ATTENDANCE_VIEW), exportAttendanceCSV)
router.get('/my', authMiddleware, authorize(PERMISSIONS.ATTENDANCE_VIEW), getMyAttendance)
router.post('/checkin', authMiddleware, authorize(PERMISSIONS.ATTENDANCE_CHECKIN), checkIn)
router.post('/checkout', authMiddleware, authorize(PERMISSIONS.ATTENDANCE_CHECKOUT), checkOut)
router.put('/:id', authMiddleware, authorize(PERMISSIONS.ATTENDANCE_UPDATE), updateAttendance)

const upload = multer({ storage: multer.memoryStorage() });
router.post('/import', authMiddleware, authorize(PERMISSIONS.ATTENDANCE_CREATE), upload.single('csv'), importAttendanceCSV);

export default router