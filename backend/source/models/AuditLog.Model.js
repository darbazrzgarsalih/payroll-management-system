import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityID: { type: mongoose.Schema.Types.ObjectId },
    oldValue: Object,
    newValue: Object,
    ipAddress: String
}, { timestamps: true })

const AuditLog = mongoose.model('AuditLog', AuditLogSchema)
export default AuditLog