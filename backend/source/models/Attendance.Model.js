import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema({
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    date: { type: Date, required: true },
    timeIn: Date,
    timeOut: Date,
    totalHours: Number,
    regularHours: Number,
    overtimeHours: Number,
    status: { type: String, enum: ['present', 'absent', 'late', 'half_day', 'on_leave'] },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    shiftStartSnapshot: String,
    shiftEndSnapshot: String,
    shiftBreakMinutesSnapshot: { type: Number, default: 0 },
    remarks: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const Attendance = mongoose.model('Attendance', AttendanceSchema)
export default Attendance