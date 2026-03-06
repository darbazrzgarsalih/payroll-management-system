import mongoose from 'mongoose'

const PositionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    departmentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    level: {
        type: String,
        enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'],
        default: 'Mid'
    },
    description: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })


PositionSchema.index({ code: 1 });
PositionSchema.index({ title: 1 });
PositionSchema.index({ departmentID: 1 });

const Position = mongoose.model('Position', PositionSchema)
export default Position