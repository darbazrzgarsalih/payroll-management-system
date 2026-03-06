import { TextItem } from "@/app/utils/ItemMappers"
import type { Employee } from "./employee.hooks"
import type { EmployeeRow } from "./employee.column"


export function mapEmployeesToRows(
    employees: Employee[],
    page: number,
    limit: number
): EmployeeRow[] {
    return employees.map((emp, index) => ({
        id: emp.id,
        enr: (page - 1) * limit + index + 1,
        employeeName: TextItem(emp.employeeName ?? "No name"),
        employeeCode: emp.employeeCode,
        email: TextItem(emp.email ?? "No email"),
        department: TextItem(emp.department ?? "No department"),
        position: TextItem(emp.position ?? "No position"),
        gender: TextItem(emp.gender ?? "Not provided"),
        address: TextItem(
            emp.address?.country && emp.address?.city
                ? `${emp.address.country}, ${emp.address.city}`
                : "No address provided"
        ),
        status: TextItem(emp.status ?? "No status"),
    }))
}