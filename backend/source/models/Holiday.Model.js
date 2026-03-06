import mongoose from 'mongoose'

const HolidaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['public', 'company', 'optional'] },
    isRecurring: Boolean,
    isPaid: Boolean,
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const Holiday = mongoose.model('Holiday', HolidaySchema)
export default Holiday