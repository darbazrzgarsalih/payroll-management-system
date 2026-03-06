import type { Department } from "./department.hooks"
import type { DepartmentRow } from "./department.column"


export function mapDepartmentsToRows(
    departments: Department[],
    page: number,
    limit: number
): DepartmentRow[] {
    return departments.map((dep, index) => ({
        id: dep._id || dep.id,
        enr: (page - 1) * limit + index + 1,
        name: dep.name ?? "No name",
        budget: dep.budget ?? 0,
        status: dep.status ?? "No status"
    }))
}