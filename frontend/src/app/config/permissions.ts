const PERMISSIONS = {
    USER_CREATE: 'user:create',
    USER_VIEW: 'user:view',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',

    SHIFT_CREATE: 'shift:create',
    SHIFT_VIEW: 'shift:view',
    SHIFT_UPDATE: 'shift:update',
    SHIFT_DEACTIVATE: 'shift:deactivate',

    DEDUCTION_CREATE: 'deduction:create',
    DEDUCTION_VIEW: 'deduction:view',
    DEDUCTION_UPDATE: 'deduction:update',
    DEDUCTION_VOID: 'deduction:void',

    DEPARTMENT_CREATE: 'department:create',
    DEPARTMENT_VIEW: 'department:view',
    DEPARTMENT_UPDATE: 'department:update',
    DEPARTMENT_DELETE: 'department:delete',

    EMPLOYEE_CREATE: 'employee:create',
    EMPLOYEE_VIEW: 'employee:view',
    EMPLOYEE_UPDATE: 'employee:update',
    EMPLOYEE_DELETE: 'employee:delete',

    PUNISHMENT_CREATE: 'punishment:create',
    PUNISHMENT_VIEW: 'punishment:view',
    PUNISHMENT_UPDATE: 'punishment:update',
    PUNISHMENT_VOID: 'punishment:void',

    OVERTIME_CREATE: 'overtime:create',
    OVERTIME_VIEW: 'overtime:view',
    OVERTIME_UPDATE: 'overtime:update',
    OVERTIME_VOID: 'overtime:void',

    PAYGRADE_CREATE: 'paygrade:create',
    PAYGRADE_VIEW: 'paygrade:view',
    PAYGRADE_UPDATE: 'paygrade:update',
    PAYGRADE_DELETE: 'paygrade:delete',

    PAYROLL_RUN: 'payroll:run',
    PAYROLL_APPROVE: 'payroll:approve',
    PAYROLL_REJECT: 'payroll:reject',
    PAYROLL_FINALIZE: 'payroll:finalize',
    PAYROLL_VIEW: 'payroll:view',

    POSITION_CREATE: 'position:create',
    POSITION_VIEW: 'position:view',
    POSITION_UPDATE: 'position:update',
    POSITION_DELETE: 'position:delete',

    REWARD_CREATE: 'reward:create',
    REWARD_VIEW: 'reward:view',
    REWARD_UPDATE: 'reward:update',
    REWARD_VOID: 'reward:void',

    SALARY_CREATE: 'salary:create',
    SALARY_VIEW: 'salary:view',
    SALARY_UPDATE: 'salary:update',
    SALARY_DELETE: 'salary:delete',

    SALARYCOMPONENT_CREATE: 'salarycomponent:create',
    SALARYCOMPONENT_VIEW: 'salarycomponent:view',
    SALARYCOMPONENT_UPDATE: 'salarycomponent:update',
    SALARYCOMPONENT_DELETE: 'salarycomponent:delete',

    LEAVE_CREATE: 'leave:create',
    LEAVE_VIEW: 'leave:view',
    LEAVE_UPDATE: 'leave:update',
    LEAVE_APPROVE: 'leave:approve',
    LEAVE_REJECT: 'leave:reject',
    LEAVE_VOID: 'leave:void',

    LEAVETYPE_CREATE: 'leavetype:create',
    LEAVETYPE_VIEW: 'leavetype:view',
    LEAVETYPE_UPDATE: 'leavetype:update',
    LEAVETYPE_DEACTIVATE: 'leavetype:deactivate',

    ATTENDANCE_CREATE: 'attendance:create',
    ATTENDANCE_VIEW: 'attendance:view',
    ATTENDANCE_UPDATE: 'attendance:update',
    ATTENDANCE_CHECKIN: 'attendance:checkin',
    ATTENDANCE_CHECKOUT: 'attendance:checkout',

    DASHBOARD_VIEW: 'dashboard:view',
    AUDITLOG_VIEW: 'auditlog:view',

    HOLIDAY_CREATE: 'holiday:create',
    HOLIDAY_VIEW: 'holiday:view',
    HOLIDAY_UPDATE: 'holiday:update',
    HOLIDAY_DELETE: 'holiday:delete',

    SETTINGS_VIEW: 'settings:view',
    SETTINGS_UPDATE: 'settings:update',

    SELF_VIEW: 'self:view'
};

export default PERMISSIONS;