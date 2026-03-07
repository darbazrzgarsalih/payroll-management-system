import mongoose from 'mongoose'

const PayGradeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true },
    level: Number,
    minSalary: { type: Number, required: true },
    maxSalary: { type: Number, required: true },
    currency: { type: String, enum: ['USD'], default: 'USD' },
    description: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const PayGrade = mongoose.model('PayGrade', PayGradeSchema)
export default PayGrade