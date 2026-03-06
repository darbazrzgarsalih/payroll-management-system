
import PERMISSIONS from "./permissions"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Analytics02Icon,
    UserGroupIcon,
    Building01Icon,
    Briefcase01Icon,
    Time01Icon,
    Calendar01Icon,
    CalendarCheckIn01Icon,
    Money01Icon,
    ReceiptDollarIcon,
    Wallet01Icon,
    Layers01Icon,
    Tag01Icon,
    MinusPlusCircle01Icon,
    GiftCardIcon,
    UserWarning01Icon,
    UserCircle02Icon,
    Clock01Icon,
    SunCloudAngledRain02Icon,
    Notification01Icon,
} from "@hugeicons/core-free-icons"
import { Activity, FileText } from "lucide-react"

export const SIDEBAR_CONFIG = [
    {
        group: "Overview",
        links: [
            {
                label: "Dashboard",
                path: "dashboard",
                permission: PERMISSIONS.DASHBOARD_VIEW,
                icon: <HugeiconsIcon icon={Analytics02Icon} strokeWidth={2} />,
                breadcrumb: "Dashboard"
            },
        ],
    },

    {
        group: "People",
        links: [
            {
                label: "Employees",
                path: "employees",
                permission: PERMISSIONS.EMPLOYEE_VIEW,
                icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
                breadcrumb: "Employees"
            },
            {
                label: "Departments",
                path: "departments",
                permission: PERMISSIONS.DEPARTMENT_VIEW,
                icon: <HugeiconsIcon icon={Building01Icon} strokeWidth={2} />,
                breadcrumb: "Departments"
            },
            {
                label: "Positions",
                path: "positions",
                permission: PERMISSIONS.POSITION_VIEW,
                icon: <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} />,
                breadcrumb: "Positions"
            },
        ],
    },

    {
        group: "Attendance & Leave",
        links: [
            {
                label: "Attendance",
                path: "attendance",
                permission: PERMISSIONS.ATTENDANCE_VIEW,
                icon: <HugeiconsIcon icon={Time01Icon} strokeWidth={2} />,
                breadcrumb: "Attendance"
            },
            {
                label: "My Attendance",
                path: "my-attendance",
                permission: PERMISSIONS.ATTENDANCE_CHECKIN,
                hideForRoles: ["admin", "super_admin"],
                icon: <HugeiconsIcon icon={CalendarCheckIn01Icon} strokeWidth={2} />,
                breadcrumb: "My Attendance"
            },
            {
                label: "Leave Requests",
                path: "leaves",
                permission: PERMISSIONS.LEAVE_VIEW,
                icon: <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />,
                breadcrumb: "Leave Requests"
            },
            {
                label: "Leave Types",
                path: "leave-types",
                permission: PERMISSIONS.LEAVETYPE_VIEW,
                icon: <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />,
                breadcrumb: "Leave Types"
            },
            {
                label: "Overtime",
                path: "overtime",
                permission: PERMISSIONS.OVERTIME_VIEW,
                icon: <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />,
                breadcrumb: "Overtime"
            },
            {
                label: "Shift",
                path: "shift",
                permission: PERMISSIONS.SHIFT_VIEW,
                icon: <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />,
                breadcrumb: "Shift"
            },
            {
                label: "Holidays",
                path: "holidays",
                permission: PERMISSIONS.HOLIDAY_VIEW,
                icon: <HugeiconsIcon icon={SunCloudAngledRain02Icon} strokeWidth={2} />,
                breadcrumb: "Holidays"
            }
        ],
    },

    {
        group: "Payroll",
        links: [
            {
                label: "Payroll Runs",
                path: "payroll",
                permission: PERMISSIONS.PAYROLL_VIEW,
                icon: <HugeiconsIcon icon={Money01Icon} strokeWidth={2} />,
                breadcrumb: "Payroll Runs"
            },
            {
                label: "Payslips",
                path: "payslips",
                permission: PERMISSIONS.PAYROLL_VIEW,
                icon: <HugeiconsIcon icon={ReceiptDollarIcon} strokeWidth={2} />,
                breadcrumb: "Payslips"
            },
            {
                label: "My Payslips",
                path: "my-payslips",
                permission: PERMISSIONS.SELF_VIEW,
                hideForRoles: ["admin", "super_admin"],
                icon: <HugeiconsIcon icon={ReceiptDollarIcon} strokeWidth={2} />,
                breadcrumb: "My Payslips"
            },
            {
                label: "Salary",
                path: "salary",
                permission: PERMISSIONS.SALARY_VIEW,
                icon: <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} />,
                breadcrumb: "Salary"
            },
            {
                label: "Salary Components",
                path: "salary-components",
                permission: PERMISSIONS.SALARYCOMPONENT_VIEW,
                icon: <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} />,
                breadcrumb: "Salary Components"
            },
            {
                label: "Pay Grades",
                path: "pay-grades",
                permission: PERMISSIONS.PAYGRADE_VIEW,
                icon: <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />,
                breadcrumb: "Pay Grades"
            },
            {
                label: "Deductions",
                path: "deductions",
                permission: PERMISSIONS.DEDUCTION_VIEW,
                icon: <HugeiconsIcon icon={MinusPlusCircle01Icon} strokeWidth={2} />,
                breadcrumb: "Deductions"
            },
        ],
    },

    {
        group: "HR Actions",
        links: [
            {
                label: "Rewards",
                path: "rewards",
                permission: PERMISSIONS.REWARD_VIEW,
                icon: <HugeiconsIcon icon={GiftCardIcon} strokeWidth={2} />,
                breadcrumb: "Rewards"
            },
            {
                label: "Punishments",
                path: "punishments",
                permission: PERMISSIONS.PUNISHMENT_VIEW,
                icon: <HugeiconsIcon icon={UserWarning01Icon} strokeWidth={2} />,
                breadcrumb: "Punishments"
            },
        ],
    },

    {
        group: "Reports",
        links: [
            {
                label: "Liability Report",
                path: "liability-report",
                permission: PERMISSIONS.PAYROLL_VIEW,
                icon: <FileText className="w-5 h-5" />,
                breadcrumb: "Liability Report"
            }
        ]
    },

    {
        group: "Settings",
        links: [
            {
                label: "Users",
                path: "users",
                permission: PERMISSIONS.USER_VIEW,
                icon: <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} />,
                breadcrumb: "Users"
            },
            {
                label: "Notifications",
                path: "notifications-admin",
                permission: PERMISSIONS.USER_VIEW,
                icon: <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} />,
                breadcrumb: "Notifications"
            },
            {
                label: "Audit Logs",
                path: "audit-logs",
                permission: PERMISSIONS.AUDITLOG_VIEW,
                icon: <Activity />,
                breadcrumb: "Audit Logs"
            },
            {
                label: "System Settings",
                path: "settings",
                permission: PERMISSIONS.SETTINGS_VIEW,
                icon: <HugeiconsIcon icon={Building01Icon} strokeWidth={2} />,
                breadcrumb: "System Settings"
            },
        ],
    },
]