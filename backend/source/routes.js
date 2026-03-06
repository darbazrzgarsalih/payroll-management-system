import express from 'express'
import authRoutes from './routes/Auth.Routes.js'
import userRoutes from './routes/User.Routes.js'
import employeeRoutes from './routes/Employee.Routes.js'
import departmentRoutes from './routes/Department.Routes.js'
import positionRoutes from './routes/Position.Routes.js'
import salaryRoutes from './routes/Salary.Routes.js'
import payGradeRoutes from './routes/PayGrade.Routes.js'
import payrollProcessRoutes from './routes/PayrollProcess.Routes.js'
import salaryComponentRoutes from './routes/SalaryComponent.Routes.js'
import rewardRoutes from './routes/Reward.Routes.js'
import overtimeRoutes from './routes/Overtime.Routes.js'
import deductionRoutes from './routes/Deduction.Routes.js'
import punishmentRoutes from './routes/Punishment.Routes.js'
import leaveRoutes from './routes/Leave.Routes.js'
import leaveTypeRoutes from './routes/LeaveType.Routes.js'
import attendanceRoutes from './routes/Attendance.Routes.js'
import paySlipRoutes from './routes/PaySlip.Routes.js'
import dashboardRoutes from './routes/Dashboard.Routes.js'
import auditLogRoutes from './routes/AuditLog.Routes.js'
import shiftRoutes from './routes/Shift.Routes.js'
import holidayRoutes from './routes/Holiday.Routes.js'
import notificationRoutes from './routes/Notification.Routes.js'
import documentRoutes from './routes/Document.Routes.js'
import settingsRoutes from './routes/Settings.Routes.js'

const app = express()

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/employees', employeeRoutes)
app.use('/api/v1/departments', departmentRoutes)
app.use('/api/v1/positions', positionRoutes)
app.use('/api/v1/salaries', salaryRoutes)
app.use('/api/v1/paygrades', payGradeRoutes)
app.use('/api/v1/payrolls', payrollProcessRoutes)
app.use('/api/v1/salary-components', salaryComponentRoutes)
app.use('/api/v1/rewards', rewardRoutes)
app.use('/api/v1/overtimes', overtimeRoutes)
app.use('/api/v1/deductions', deductionRoutes)
app.use('/api/v1/punishments', punishmentRoutes)
app.use('/api/v1/leaves', leaveRoutes)
app.use('/api/v1/leave-types', leaveTypeRoutes)
app.use('/api/v1/attendances', attendanceRoutes)
app.use('/api/v1/payslip', paySlipRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/audit-logs', auditLogRoutes)
app.use('/api/v1/shifts', shiftRoutes)
app.use('/api/v1/holidays', holidayRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/documents', documentRoutes)
app.use('/api/v1/settings', settingsRoutes)

export default app