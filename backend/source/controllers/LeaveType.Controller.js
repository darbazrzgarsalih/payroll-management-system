import mongoose from "mongoose";
import LeaveType from "../models/LeaveType.Model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/Error.Classes.js";
import Leave from "../models/Leave.Model.js";

export const createLeaveType = async (req, res, next) => {
    try {
        const { name, defaultDays } = req.body;
        if (!name || !defaultDays) {
            return next(new BadRequestError("Name is required"))
        }

        if (defaultDays <= 0) {
            return next(new BadRequestError("Default must be greater than 0"))
        }

        const existingLeaveType = await LeaveType.findOne({ name })
        if (existingLeaveType) {
            return next(new BadRequestError("Leave type already exists"))
        }

        const leaveType = new LeaveType({
            name: name.trim(),
            defaultDays,
            createdBy: req.user._id
        })

        await leaveType.save()

        return res.status(201).json({
            success: true,
            message: "Leave type created",
            leaveType
        })
    } catch (error) {

        
        return next(new InternalServerError("Could not create leave type"))
    }
}

export const getAllLeaveTypes = async (req, res, next) => {
    try {
        const { name, code, status } = req.query;
        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 1)
        const skip = (page - 1) * limit

        let queryObject = {}
        if (name) {
            queryObject.name = { $regex: name, $options: 'i' }
        }
        if (code) {
            queryObject.code = { $regex: code, $options: 'i' }
        }

        if(status) {
            queryObject.status = status
        }

        const leaveTypes = await LeaveType.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')

        const total = await LeaveType.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Leave types found",
            total,
            totalPages: Math.ceil(total / limit),
            leaveTypes,
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch leave types"))
    }
}

export const getSingleLeaveType = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("LeaveType ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const leaveType = await LeaveType.findById(id)
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')
        if (!leaveType) {
            return next(new NotFoundError("Leave type not found"))
        }



        return res.status(200).json({
            success: true,
            message: "Leave type found",
            leaveType
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch leave type"))
    }
}

export const deactivateLeaveType = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("LeaveType ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const leaveType = await LeaveType.findOne({ _id: id, })
        if (!leaveType) {
            return next(new NotFoundError("Leave type not found"))
        }
        if (leaveType.status !== 'active') {
            return next(new BadRequestError("Leave type already deactivated"))
        }

        const isUsed = await Leave.exists({ leaveTypeID: id })
        if (isUsed) {
            return next(new BadRequestError("Cannot deactivate Leave type that already in use by employees"))
        }

        leaveType.status = 'inactive'
        leaveType.updatedBy = req.user._id
        leaveType.deactivatedBy = req.user._id;
        leaveType.deactivatedAt = new Date()
        await leaveType.save()
        return res.status(200).json({
            success: true,
            message: "Leave type has been deactivated"
        })
    } catch (error) {
        return next(new InternalServerError("Could not deactivate leave type"))
    }
}

export const updateLeaveType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, defaultDays } = req.body;

        if (!id) {
            return next(new BadRequestError("LeaveType ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const leaveType = await LeaveType.findById(id)

        if (!leaveType) {
            return next(new NotFoundError("Leave type not found"))
        }

        if (leaveType.status !== 'active') {
            return next(new BadRequestError("Only active leave types can be updated"))
        }

        if (name) {
            const existing = await LeaveType.findOne({ name: name.trim(), _id: { $ne: id } })
            if (existing) {
                return next(new BadRequestError("Leave type with this name already exists"))
            }
            leaveType.name = name.trim()
        }

        if (defaultDays !== undefined) {
            if (defaultDays <= 0) {
                return next(new BadRequestError("Default days must be greater than 0"))
            }
            leaveType.defaultDays = defaultDays
        }

        leaveType.updatedBy = req.user._id

        await leaveType.save()

        return res.status(200).json({
            success: true,
            message: "Leave type has been updated",
            leaveType
        })

    } catch (error) {
        return next(new InternalServerError("Could not update leave type"))
    }
}