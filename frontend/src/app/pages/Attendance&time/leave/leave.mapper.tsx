import type { Leave } from "./leave.hooks"
import type { LeaveRow } from "./leave.column"


export function mapLeavesToRows(
    leaves: Leave[],
    page: number,
    limit: number
): LeaveRow[] {
    return leaves.map((lev, index) => ({
        id: lev.id || lev._id,
        enr: (page - 1) * limit + index + 1,
        employeeName: lev.employeeName ?? "No name",
        leaveType: lev.leaveType ?? "No type",
        startDate: lev.startDate ?? "N/A",
        endDate: lev.endDate ?? "N/A",
        totalDays: lev.totalDays ?? 0,
        reason: lev.reason,
        status: lev.status ?? "Pending"
    }))
}