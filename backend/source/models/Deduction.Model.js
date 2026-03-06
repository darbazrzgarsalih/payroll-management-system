import mongoose from 'mongoose'

const DeductionSchema = new mongoose.Schema({
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    type: { type: String, enum: ['tax', 'insurance', 'loan', 'advance', 'garnishment', 'other'] },
    name: { type: String, required: true },
    amount: Number,
    percentage: Number,
    calculationType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    frequency: { type: String, enum: ['monthly', 'per_payroll', 'one_time'] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: Number,
    remainingAmount: Number,
    status: { type: String, enum: ['active', 'completed', 'voided'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voidedAt: Date
}, { timestamps: true })

const Deduction = mongoose.model('Deduction', DeductionSchema)
export default Deduction