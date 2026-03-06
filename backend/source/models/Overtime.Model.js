import mongoose from 'mongoose'

const OvertimeSchema = new mongoose.Schema({
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    hours: { type: Number, required: true },
    rate: { type: Number, default: 10 },
    multiplier: { type: Number, default: 1.25 },
    amount: Number,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid', 'voided'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payrollID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll', required: false },
    remarks: String,
    voidedAt: Date,
    voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

OvertimeSchema.pre('save', function () {
    if (this.hours && this.rate) {
        this.amount = this.hours * this.rate * (this.multiplier || 1);
    }
});

const Overtime = mongoose.model('Overtime', OvertimeSchema)
export default Overtime