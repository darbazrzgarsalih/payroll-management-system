import mongoose from 'mongoose'

const RewardSchema = new mongoose.Schema({
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['performance', 'annual', 'festive', 'project', 'referral', 'other'], default: 'other' },
    amount: { type: Number, required: true },
    reason: String,
    paymentDate: Date,
    status: { type: String, enum: ['pending', 'approved', 'paid', 'cancelled', 'voided'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payrollID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll' },
    isTaxable: { type: Boolean, default: 'false' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voidedAt: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const Reward = mongoose.model('Reward', RewardSchema)
export default Reward