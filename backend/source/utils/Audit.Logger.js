import AuditLog from "../models/AuditLog.Model.js";

export const logAudit = async ({
    req,
    action,
    entity,
    entityID,
    oldValue,
    newValue
}) => {
    try {
        await AuditLog.create({
            userID: req.user._id,
            action,
            entity,
            entityID,
            oldValue,
            newValue,
            ipAddress: req.ip
        })
    } catch (error) {
        
    }
}