import mongoose from 'mongoose'

const PayslipJobSchema = new mongoose.Schema({
    jobId: { type: String, required: true, unique: true, index: true },
    payrollID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'running', 'done', 'failed'],
        default: 'pending'
    },
    progress: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    message: { type: String, default: 'Starting...' },
    error: { type: String, default: null },
    result: {
        count: { type: Number, default: 0 }
    }
}, { timestamps: true })

const PayslipJob = mongoose.model('PayslipJob', PayslipJobSchema)
export default PayslipJob
