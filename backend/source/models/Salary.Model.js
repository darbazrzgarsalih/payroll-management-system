import mongoose from 'mongoose'

const SalarySchema = new mongoose.Schema({
    employeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    salaryType: {
        type: String,
        enum: ['hourly', 'monthly', 'daily'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        enum: ['USD'],
        default: 'USD'
    },
    effectiveDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    payGradeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PayGrade',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

SalarySchema.index({ employeeID: 1, status: 1 });
SalarySchema.index({ payGradeID: 1 });
SalarySchema.index({ effectiveDate: 1 });

const Salary = mongoose.model('Salary', SalarySchema)
export default Salary