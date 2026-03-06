const sidebarConfig = {
    overview: [
        { label: "Dashboard", path: "/dashboard" },
    ],
    people: [
        { label: "Employees", path: "/employees", roles: ["admin", "hr_manager", "super_admin"] },
        { label: "Departments", path: "/departments", roles: ["admin", "hr_manager", "super_admin"] },
        { label: "Positions", path: "/positions", roles: ["admin", "hr_manager", "super_admin"] },
        { label: "Users", path: "/users", roles: ["admin", "super_admin"] },
    ],
    attendanceAndLeave: [
        { label: "Attendance", path: "/attendance", roles: ["admin", "hr_manager", "super_admin"] },
        { label: "My Attendance", path: "/my-attendance", roles: ["employee", "hr_manager", "overtime_manager", "punishment_manager", "leave_manager"] },
        { label: "Leave Requests", path: "/leaves", roles: ["admin", "hr_manager", "leave_manager", "super_admin"] },
        { label: "Leave Types", path: "/leave-types", roles: ["admin", "hr_manager", "super_admin"] },
        { label: "Overtime", path: "/overtime", roles: ["admin", "hr_manager", "overtime_manager", "super_admin"] },
        { label: "Shift", path: "/shift", roles: ["admin", "hr_manager", "super_admin"] },
    ],
    payroll: [
        { label: "Payroll Runs", path: "/payroll", roles: ["payroll_manager", "super_admin", "admin"] },
        { label: "Payslips", path: "/payslips", roles: ["payroll_manager", "super_admin", "admin"] },
        { label: "My Payslips", path: "/my-payslips", roles: ["employee", "hr_manager", "overtime_manager", "punishment_manager", "leave_manager"] },
        { label: "Salary", path: "/salary", roles: ["payroll_manager", "super_admin", "admin"] },
        { label: "Salary Components", path: "/salary-components", roles: ["payroll_manager", "super_admin", "admin"] },
        { label: "Pay Grades", path: "/pay-grades", roles: ["payroll_manager", "super_admin", "admin"] },
        { label: "Deductions", path: "/deductions", roles: ["payroll_manager", "super_admin", "admin"] },
    ],
    hrActions: [
        { label: "Rewards", path: "/rewards", roles: ["admin", "hr_manager", "super_admin"] },
        { label: "Punishments", path: "/punishments", roles: ["admin", "hr_manager", "punishment_manager", "super_admin"] },
    ],
    system: [
        { label: "Audit Logs", path: "/audit-logs", roles: ["super_admin"] },
    ],
}

export default sidebarConfig;