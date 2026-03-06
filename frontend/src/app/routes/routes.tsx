import PERMISSIONS from "../config/permissions";
import Attendance from "../pages/Attendance&time/attendance/Attendance";
import Leave from "../pages/Attendance&time/leave/Leave";
import MyAttendance from "../pages/Attendance&time/attendance/MyAttendance";
import Dashboard from "../pages/overview/dashboard/Dashboard";
import Departments from "../pages/people/departments/Departments";
import Employee from "../pages/people/employees/Employee";
import EmployeeProfile from "../pages/people/employees/EmployeeProfile";
import Positions from "../pages/people/positions/Positions";
import LeaveType from '../pages/Attendance&time/leavetype/LeaveType'
import Overtime from "../pages/Attendance&time/overtime/Overtime";
import PayrollRun from "../pages/payroll/payrollRuns/PayrollRun";
import Payslips from "../pages/payroll/payslips/payslips";
import MyPayslips from "../pages/payroll/payslips/my-payslips";
import Salary from "../pages/payroll/salary/Salary";
import SalaryComponent from "../pages/payroll/salarycomponent/SalaryComponent";
import Paygrade from "../pages/payroll/paygrade/Paygrade";
import Deductions from "../pages/payroll/deductions/Deductions";
import Rewards from "../pages/hrActions/rewards/Rewards";
import Punishments from "../pages/hrActions/punishments/Punishments";
import Users from "../pages/system/users/Users";
import AuditLogs from "../pages/system/audit Logs/AuditLogs";
import NotificationsAdmin from "../pages/system/notifications/Notifications";
import Shift from "../pages/Attendance&time/shift/Shift";
import PayrollDetails from "../pages/payroll/payrollDetails/PayrollDetails";
import Holidays from "../pages/Attendance&time/holiday/Holidays";
import Settings from "../pages/system/settings/Settings";
import LiabilityReport from "../pages/reports/liability/LiabilityReport";
import Account from "../pages/system/users/Account";

export const ROUTES_CONFIG = [
    {
        path: "dashboard",
        permission: PERMISSIONS.DASHBOARD_VIEW,
        component: <Dashboard />,
    },
    {
        path: "employees",
        permission: PERMISSIONS.EMPLOYEE_VIEW,
        component: <Employee />,
    },
    {
        path: "employees/:id/profile",
        permission: PERMISSIONS.EMPLOYEE_VIEW,
        component: <EmployeeProfile />
    },
    {
        path: "departments",
        permission: PERMISSIONS.DEPARTMENT_VIEW,
        component: <Departments />,
    },
    {
        path: "positions",
        permission: PERMISSIONS.POSITION_VIEW,
        component: <Positions />,
    },
    {
        path: "attendance",
        permission: PERMISSIONS.ATTENDANCE_VIEW,
        component: <Attendance />,
    },
    {
        path: "leaves",
        permission: PERMISSIONS.LEAVE_VIEW,
        component: <Leave />,
    },
    {
        path: "leave-types",
        permission: PERMISSIONS.LEAVETYPE_VIEW,
        component: <LeaveType />,
    },
    {
        path: "overtime",
        permission: PERMISSIONS.OVERTIME_VIEW,
        component: <Overtime />
    },
    {
        path: "payslips",
        permission: PERMISSIONS.PAYROLL_VIEW,
        component: <Payslips />
    },
    {
        path: "my-payslips",
        permission: PERMISSIONS.SELF_VIEW,
        component: <MyPayslips />
    },
    {
        path: "salary",
        permission: PERMISSIONS.SALARY_VIEW,
        component: <Salary />
    },
    {
        path: "salary-components",
        permission: PERMISSIONS.SALARYCOMPONENT_VIEW,
        component: <SalaryComponent />
    },
    {
        path: "pay-grades",
        permission: PERMISSIONS.PAYGRADE_VIEW,
        component: <Paygrade />
    },
    {
        path: "deductions",
        permission: PERMISSIONS.DEDUCTION_VIEW,
        component: <Deductions />
    },
    {
        path: "rewards",
        permission: PERMISSIONS.REWARD_VIEW,
        component: <Rewards />
    },
    {
        path: "punishments",
        permission: PERMISSIONS.PUNISHMENT_VIEW,
        component: <Punishments />
    },
    {
        path: "users",
        permission: PERMISSIONS.USER_VIEW,
        component: <Users />
    },
    {
        path: "audit-logs",
        permission: PERMISSIONS.AUDITLOG_VIEW,
        component: <AuditLogs />
    },
    {
        path: "notifications-admin",
        permission: PERMISSIONS.USER_VIEW,
        component: <NotificationsAdmin />
    },
    {
        path: "payroll",
        permission: PERMISSIONS.PAYROLL_VIEW,
        component: <PayrollRun />
    },
    {
        path: "payroll/:id/summary",
        permission: PERMISSIONS.PAYROLL_VIEW,
        component: <PayrollDetails />
    },
    {
        path: "my-attendance",
        permission: PERMISSIONS.SELF_VIEW,
        component: <MyAttendance />
    },
    {
        path: "shift",
        permission: PERMISSIONS.SHIFT_VIEW,
        component: <Shift />
    },
    {
        path: "holidays",
        permission: PERMISSIONS.HOLIDAY_VIEW,
        component: <Holidays />
    },
    {
        path: "settings",
        permission: PERMISSIONS.SETTINGS_VIEW,
        component: <Settings />
    },
    {
        path: "liability-report",
        permission: PERMISSIONS.PAYROLL_VIEW,
        component: <LiabilityReport />
    },
    {
        path: "account",
        permission: PERMISSIONS.SELF_VIEW,
        component: <Account />
    }
]
