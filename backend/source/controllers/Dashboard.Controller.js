import User from '../models/User.Model.js'
import Employee from '../models/Employee.Model.js';
import Attendance from '../models/Attendance.Model.js';
import Payroll from '../models/Payroll.Model.js';
import PayrollItem from '../models/PayrollItem.Model.js';
import { InternalServerError } from '../utils/Error.Classes.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        const role = req.user.role
        const employeeID = req.user.employeeID

        let stats = {}
        if (['super_admin', 'admin'].includes(role)) {
            const totalUsers = await User.countDocuments()
            const totalEmployees = await Employee.countDocuments()
            const activeEmployees = await Employee.countDocuments({ 'employmentInfo.status': 'active' })

            const payrollsThisMonth = await Payroll.countDocuments({ status: 'approved' })

            const payrollTotals = await Payroll.aggregate([
                { $group: { _id: null, totalNetPay: { $sum: "$totalNetPay" } } }
            ])

            stats = {
                totalUsers,
                totalEmployees,
                activeEmployees,
                payrollsThisMonth,
                totalNetPay: payrollTotals[0]?.totalNetPay || 0
            }
        }

        if (role === 'hr_manager') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const [presentToday, halfDayToday, absentToday] = await Promise.all([
                Attendance.countDocuments({ date: today, status: 'present' }),
                Attendance.countDocuments({ date: today, status: 'half_day' }),
                Attendance.countDocuments({ date: today, status: 'absent' }),
            ])

            stats = { presentToday, halfDayToday, absentToday }
        }

        if (role === 'payroll_manager') {
            const pendingPayrolls = await Payroll.countDocuments({ status: 'pending' })

            const payrollTotals = await PayrollItem.aggregate([
                { $group: { _id: null, totalNetPay: { $sum: "$netPay" } } }
            ])

            stats = {
                pendingPayrolls,
                totalNetPay: payrollTotals[0]?.totalNetPay || 0
            }
        }

        if (role === 'employee') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const [todayAttendance, myPayslip] = await Promise.all([
                Attendance.findOne({ employeeID, date: today }),
                PayrollItem.findOne({ employeeID }).sort({ createdAt: -1 }).select('netPay')
            ])

            stats = {
                checkedIn: !!todayAttendance,
                todayRecord: todayAttendance,
                todayStatus: todayAttendance?.status || 'absent',
                lastPayslips: myPayslip?.netPay || 0
            }
        }

        return res.status(200).json({ success: true, stats })
    } catch (error) {
        return next(new InternalServerError("Could not fetch dashboard stats"))
    }
}

// ─── Chart 1: Weekly Attendance (last 7 days) ─────────────────────────────────
export const getWeeklyAttendanceChart = async (req, res, next) => {
    try {
        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            d.setDate(d.getDate() - i)
            days.push(d)
        }

        const results = await Promise.all(
            days.map(async (day) => {
                const nextDay = new Date(day)
                nextDay.setDate(nextDay.getDate() + 1)

                const [present, absent, late, half_day] = await Promise.all([
                    Attendance.countDocuments({ date: { $gte: day, $lt: nextDay }, status: 'present' }),
                    Attendance.countDocuments({ date: { $gte: day, $lt: nextDay }, status: 'absent' }),
                    Attendance.countDocuments({ date: { $gte: day, $lt: nextDay }, status: 'late' }),
                    Attendance.countDocuments({ date: { $gte: day, $lt: nextDay }, status: 'half_day' }),
                ])

                return {
                    day: day.toLocaleDateString('en-US', { weekday: 'short' }),
                    date: day.toISOString().split('T')[0],
                    present,
                    absent,
                    late,
                    half_day
                }
            })
        )

        return res.status(200).json({ success: true, data: results })
    } catch (error) {
        return next(new InternalServerError("Could not fetch weekly attendance chart"))
    }
}

// ─── Chart 2: Today's Attendance Pie ─────────────────────────────────────────
export const getTodayAttendancePie = async (req, res, next) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const [present, absent, late, half_day, on_leave] = await Promise.all([
            Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'present' }),
            Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'absent' }),
            Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'late' }),
            Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'half_day' }),
            Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'on_leave' }),
        ])

        return res.status(200).json({
            success: true,
            data: [
                { name: 'Present', value: present },
                { name: 'Absent', value: absent },
                { name: 'Late', value: late },
                { name: 'Half Day', value: half_day },
                { name: 'On Leave', value: on_leave },
            ]
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch today's attendance pie"))
    }
}

// ─── Chart 3: Payroll Cost Last 6 Months ─────────────────────────────────────
export const getPayrollTrendChart = async (req, res, next) => {
    try {
        const months = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setDate(1)
            d.setHours(0, 0, 0, 0)
            d.setMonth(d.getMonth() - i)
            months.push(d)
        }

        const results = await Promise.all(
            months.map(async (monthStart) => {
                const monthEnd = new Date(monthStart)
                monthEnd.setMonth(monthEnd.getMonth() + 1)

                const result = await Payroll.aggregate([
                    {
                        $match: {
                            status: { $in: ['approved', 'paid'] },
                            'payPeriod.payDate': { $gte: monthStart, $lt: monthEnd }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalNetPay: { $sum: '$totalNetPay' },
                            totalGrossPay: { $sum: '$totalGrossPay' },
                            totalDeductions: { $sum: '$totalDeductions' },
                            count: { $sum: 1 }
                        }
                    }
                ])

                return {
                    month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
                    year: monthStart.getFullYear(),
                    netPay: result[0]?.totalNetPay || 0,
                    grossPay: result[0]?.totalGrossPay || 0,
                    deductions: result[0]?.totalDeductions || 0,
                    payrolls: result[0]?.count || 0
                }
            })
        )

        return res.status(200).json({ success: true, data: results })
    } catch (error) {
        return next(new InternalServerError("Could not fetch payroll trend chart"))
    }
}

// ─── Chart 4: Department Headcount ───────────────────────────────────────────
export const getDepartmentHeadcountChart = async (req, res, next) => {
    try {
        const result = await Employee.aggregate([
            {
                $match: { 'employmentInfo.status': 'active' }
            },
            {
                $group: {
                    _id: '$employmentInfo.departmentID',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $ifNull: [
                            { $arrayElemAt: ['$department.name', 0] },
                            'Unassigned'
                        ]
                    },
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ])

        return res.status(200).json({ success: true, data: result })
    } catch (error) {
        console.error('Department headcount error:', error) // ← this will show the real error
        return next(new InternalServerError("Could not fetch department headcount"))
    }
}