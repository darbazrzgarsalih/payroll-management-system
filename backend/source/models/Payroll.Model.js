import mongoose from 'mongoose'

const PayrollSchema = new mongoose.Schema({
    payrollCode: { type: String, required: true, unique: true, trim: true },
    payPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        payDate: { type: Date, required: true }
    },
    status: {
        type: String,
        enum: ['draft', 'processing', 'approved', 'paid', 'rejected'],
        default: 'draft'
    },
    totalGrossPay: { type: Number, default: 0, min: 0 },
    totalDeductions: { type: Number, default: 0, min: 0 },
    totalNetPay: { type: Number, default: 0, min: 0 },
    totalEmployees: { type: Number, default: 0, min: 0 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paymentDate: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelReason: { type: String },
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })


PayrollSchema.index({ payrollCode: 1 });
PayrollSchema.index({ status: 1 });
PayrollSchema.index({ 'payPeriod.startDate': 1, 'payPeriod.endDate': 1 });

const Payroll = mongoose.model('Payroll', PayrollSchema)
export default Payroll