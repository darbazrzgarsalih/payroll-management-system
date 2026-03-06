import mongoose from 'mongoose';
import AuditLog from "../models/AuditLog.Model.js";

export const getAuditLogs = async (req, res, next) => {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 15)
    const { search, action, entity, entityID, from, to } = req.query
    const skip = (page - 1) * limit

    let queryObject = {}

    if (search) {
        queryObject.$or = [
            { action: { $regex: search, $options: 'i' } },
            { entity: { $regex: search, $options: 'i' } },
        ]
    }

    if (action) {
        queryObject.action = action
    }

    if (entity) {
        queryObject.entity = entity
    }

    if (entityID && mongoose.Types.ObjectId.isValid(entityID)) {
        queryObject.entityID = new mongoose.Types.ObjectId(entityID)
    }

    if (from || to) {
        queryObject.createdAt = {}
        if (from) queryObject.createdAt.$gte = new Date(from)
        if (to) {
            const toDate = new Date(to)
            toDate.setHours(23, 59, 59, 999)
            queryObject.createdAt.$lte = toDate
        }
    }

    const logs = await AuditLog.find(queryObject)
        .populate('userID', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    const total = await AuditLog.countDocuments(queryObject)

    const transformedLogs = logs.map((l) => ({
        id: l._id,
        user: l.userID?.username,
        action: l.action,
        entity: l.entity,
        entityID: l.entityID,
        oldValue: l.oldValue,
        newValue: l.newValue,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt
    }))

    res.status(200).json({
        success: true,
        message: "Auditlogs found",
        logs: transformedLogs,
        total,
    })
}

export const getSingleAuditLog = async (req, res, next) => {
    const { id } = req.params

    const log = await AuditLog.findById(id).populate('userID', 'username role')

    if (!log) {
        return res.status(404).json({ success: false, message: "Audit log not found" })
    }

    res.status(200).json({
        success: true,
        message: "Audit log found",
        log: {
            id: log._id,
            user: log.userID?.username,
            role: log.userID?.role,
            action: log.action,
            entity: log.entity,
            entityID: log.entityID,
            oldValue: log.oldValue,
            newValue: log.newValue,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt
        }
    })
}