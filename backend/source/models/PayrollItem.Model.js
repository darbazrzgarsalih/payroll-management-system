import mongoose from 'mongoose'

const PayrollItemSchema = new mongoose.Schema({
    // payrollItemCode: { type: String, required: true },
    componentBreakdown: [{
        componentID: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeSalaryStructure' },
        amount: Number
    }],
    payrollID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll', required: true },
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    // salaryStructureID: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeSalaryStructure', required: true },
    baseSalary: { type: Number, min: 0 },
    rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reward' }],
    overtimes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Overtime'
    }],
    grossPay: Number,
    totalRewards: Number,
    totalOvertimes: Number,
    totalPunishments: Number,
    totalDeductions: Number,
    deductions: [
        {
            deductionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Deduction' },
        }
    ],
    punishments: [
        {
            punishmentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Punishment' },
        }
    ],
    netPay: { type: Number },
    status: { type: String, enum: ['pending', 'processed', 'paid', 'failed', 'locked', 'finalized'], default: 'pending' },
    paymentMethod: { type: String, enum: ['Bank_transfer', 'check', 'cash'], default: 'cash' },
    paymentDate: { type: Date },
    paySlipID: { type: mongoose.Schema.Types.ObjectId, ref: 'PaySlip' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const PayrollItem = mongoose.model('PayrollItem', PayrollItemSchema)
export default PayrollItem