import { z } from 'zod'

export const employeeSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "last name is required"),
    email: z.string().email("Invalid email"),
    // gender: z.enum(["Male", "Female"]),
    hireDate: z.string(),
    // departmentID: z.string().min(1, "Department is required"),
    // positionID: z.string().min(1, "Position is required")
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>