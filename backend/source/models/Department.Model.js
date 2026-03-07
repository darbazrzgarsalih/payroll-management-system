import mongoose from 'mongoose'

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // code: { type: String, required: true, unique: true, trim: true },

    budget: { type: Number, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })


DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ name: 1 });

const Department = mongoose.model('Department', DepartmentSchema)
export default Department