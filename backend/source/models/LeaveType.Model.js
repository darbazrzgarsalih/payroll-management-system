import mongoose from 'mongoose'

const LeaveTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    defaultDays: { type: Number },
    isPaid: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: true },
    requiresDocument: { type: Boolean, default: false },
    carryForward: { type: Boolean, default: false },
    maxCarryForwardDays: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deactivatedAt: Date,
}, { timestamps: true })

const LeaveType = mongoose.model('LeaveType', LeaveTypeSchema)
export default LeaveType