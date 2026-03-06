import mongoose from "mongoose"
import Shift from "../models/Shift.Model.js"
import { BadRequestError, NotFoundError, InternalServerError } from "../utils/Error.Classes.js"

export const createShift = async (req, res, next) => {
    try {
        const {
            name,
            code,
            startTime,
            endTime,
            breakMinutes,
            gracePeriodMinutes,
            workDays,
            isNightShift,
            overtimeThresholdMinutes
        } = req.body

        if (!name || !startTime || !endTime) {
            return next(new BadRequestError("Name, startTime and endTime are required"))
        }

        const existing = await Shift.findOne({ name: name.trim() })
        if (existing) {
            return next(new BadRequestError("Shift with this name already exists"))
        }

        const shift = await Shift.create({
            name: name.trim(),
            code: code?.trim(),
            startTime,
            endTime,
            breakMinutes: breakMinutes || 0,
            gracePeriodMinutes: gracePeriodMinutes || 0,
            workDays: workDays || [],
            isNightShift: isNightShift || false,
            overtimeThresholdMinutes: overtimeThresholdMinutes || 0,
            createdBy: req.user._id
        })

        res.status(201).json({
            success: true,
            message: "Shift created successfully",
            shift
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not create shift"))
    }
}

export const getAllShifts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query

        const query = {}
        if (status) query.status = status

        const skips = (Number(page) - 1) * Number(limit)

        const [shifts, total] = await Promise.all([
            Shift.find(query)
                .sort({ createdAt: -1 })
                .skip(skips)
                .limit(Number(limit)),
            Shift.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            total,
            shifts
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch shifts"))
    }
}

export const getSingleShift = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const shift = await Shift.findById(id)

        if (!shift) {
            return next(new NotFoundError("Shift not found"))
        }

        res.status(200).json({
            success: true,
            shift
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch shift"))
    }
}

export const updateShift = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const shift = await Shift.findById(id)
        if (!shift) {
            return next(new NotFoundError("Shift not found"))
        }

        if (shift.status !== "active") {
            return next(new BadRequestError("Only active shifts can be updated"))
        }

        const allowedUpdates = [
            "name",
            "code",
            "startTime",
            "endTime",
            "breakMinutes",
            "gracePeriodMinutes",
            "workDays",
            "isNightShift",
            "overtimeThresholdMinutes"
        ]

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                shift[field] = req.body[field]
            }
        })

        shift.updatedBy = req.user._id

        await shift.save()

        res.status(200).json({
            success: true,
            message: "Shift updated successfully",
            shift
        })
    } catch (error) {
        return next(new InternalServerError("Could not update shift"))
    }
}

export const deactivateShift = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const shift = await Shift.findById(id)
        if (!shift) {
            return next(new NotFoundError("Shift not found"))
        }

        shift.status = "inactive"
        shift.updatedBy = req.user._id

        await shift.save()

        res.status(200).json({
            success: true,
            message: "Shift deactivated successfully"
        })
    } catch (error) {
        return next(new InternalServerError("Could not deactivate shift"))
    }
}