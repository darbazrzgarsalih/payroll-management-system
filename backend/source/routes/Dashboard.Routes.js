import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import {
    getDashboardStats,
    getWeeklyAttendanceChart,
    getTodayAttendancePie,
    getPayrollTrendChart,
    getDepartmentHeadcountChart
} from '../controllers/Dashboard.Controller.js';

const router = express.Router()

router.get("/stats", authMiddleware, getDashboardStats)
router.get("/charts/weekly-attendance", authMiddleware, getWeeklyAttendanceChart)
router.get("/charts/today-attendance", authMiddleware, getTodayAttendancePie)
router.get("/charts/payroll-trend", authMiddleware, getPayrollTrendChart)
router.get("/charts/department-headcount", authMiddleware, getDepartmentHeadcountChart)

export default router