import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['payroll', 'leave', 'attendance', 'system', 'reminder'] },
    title: {type: String, required: true},
    message: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] },
    isRead: {type: Boolean, default: false},
    readAt: Date,
    actionUrl: String,
}, { timestamps: true })

const Notification = mongoose.model('Notification', NotificationSchema)
export default Notification