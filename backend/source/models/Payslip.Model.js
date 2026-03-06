import mongoose from 'mongoose'

const PaySlipSchema = new mongoose.Schema({
    payrollItemID: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollItem' },
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    payrollID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll' },
    payPeriod: {
        startDate: Date,
        endDate: Date
    },
    baseSalary: Number,
    grossPay: Number,
    netPay: Number,
    earnings: [{
        description: String,
        amount: Number
    }],
    deductions: [{
        description: String,
        amount: Number
    }],
    rewards: [{
        description: String,
        amount: Number
    }],
    overtimes: [{
        description: String,
        amount: Number
    }],
    punishments: [{
        description: String,
        amount: Number
    }],
    status: {
        type: String,
        enum: ['draft', 'approved', 'paid'],
        default: 'draft'
    },
    
    ytdEarnings: { type: Number, default: 0 },
    ytdDeductions: { type: Number, default: 0 },
    
    fileUrl: String,
    generatedAt: Date,
    
    isAdjustment: { type: Boolean, default: false },
    adjustedPayslipID: { type: mongoose.Schema.Types.ObjectId, ref: 'PaySlip' },
    adjustmentReason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidAt: { type: Date },
    payDate: Date,
}, { timestamps: true })

PaySlipSchema.index({ employeeID: 1, status: 1 });
PaySlipSchema.index({ payrollID: 1 });
PaySlipSchema.index({ payDate: -1 });

const PaySlip = mongoose.model('PaySlip', PaySlipSchema)
export default PaySlip