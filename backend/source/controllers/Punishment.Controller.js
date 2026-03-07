import mongoose from "mongoose";
import Punishment from "../models/Punishment.Model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/Error.Classes.js";

export const getAllPunishments = async (req, res, next) => {
    try {
        const { employeeID, name, type, frequency, status } = req.query;

        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 50)
        const skip = (page - 1) * limit;
        let queryObject = {}
        if (employeeID) {
            if (!mongoose.Types.ObjectId.isValid(employeeID)) {
                return next(new BadRequestError("Invalid ID"))
            }
            queryObject.employeeID = employeeID
        }

        if (name) {
            queryObject.name = { $regex: name, $options: 'i' }
        }

        if (type) {
            queryObject.type = type
        }

        if (frequency) {
            queryObject.frequency = frequency
        }

        if (status) {
            queryObject.status = status
        }
        const punishments = await Punishment.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName')
            .populate('createdBy', 'username role')
            .populate('updatedBy', 'username role')

        const transformedPunishments = punishments.map((p) => {
            return {
                id: p._id.toString(),
                employeeName: [
                    p.employeeID?.personalInfo.firstName,
                    p.employeeID?.personalInfo.middleName,
                    p.employeeID?.personalInfo.lastName,
                ].filter(Boolean).join(" "),
                type: p.type,
                name: p.name,
                amount: p.amount,
                percentage: p.percentage,
                calculationType: p.calculationType,
                frequency: p.frequency,
                startDate: p.startDate,
                endDate: p.endDate,
                totalAmount: p.totalAmount,
                remainingAmount: p.remainingAmount,
                status: p.status,
            }
        })

        const total = await Punishment.countDocuments(queryObject)
        return res.status(200).json({
            success: true,
            message: "Punishments found",
            total,
            totalPages: Math.ceil(total / limit),
            punishments: transformedPunishments
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch punishments"))
    }
}

export const getSinglePunishment = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("Punishment ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const punishment = await Punishment.findById(id)
        if (!punishment) {
            return next(new NotFoundError("Punishment not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Punishment found",
            punishment
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch punishment"))
    }
}

export const createPunishment = async (req, res, next) => {
    try {
        const { employeeID, name, type, amount, startDate, endDate } = req.body;

        if (!employeeID || !name || !type || !amount || !startDate) {
            return next(new BadRequestError("EmployeeID, name, type, amount, and startDate are required fields"))
        }
        if (!mongoose.Types.ObjectId.isValid(employeeID)) {
            return next(new BadRequestError("Invalid employee ID"))
        }
        const existingPunishment = await Punishment.findOne({
            name,
            employeeID,
            status: { $ne: 'voided' }
        })

        if (existingPunishment) {
            return next(new BadRequestError("Punishment already exists"))
        }

        const punishment = new Punishment({
            employeeID,
            name,
            type,
            amount,
            startDate,
            endDate,
            createdBy: req.user._id
        })

        await punishment.save()

        return res.status(201).json({
            success: true,
            message: "Punishment created",
            punishment
        })
    } catch (error) {
        console.error("Create Punishment Error:", error);
        return next(new InternalServerError(error.message || "Could not create punishment"))
    }
}

export const updatePunishment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Punishment ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const allowedUpdates = [
            'type',
            'name',
            'amount',
            'calculationType',
            'frequency',
        ]

        const buildUpdateObj = (updates, allowedFields) => {
            const updateObj = {}

            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateObj[field] = updates[field]
                }
            }

            return updateObj
        }

        const updateData = buildUpdateObj(req.body, allowedUpdates)
        updateData.updatedBy = req.user._id

        const punishment = await Punishment.findByIdAndUpdate({ _id: id }, { $set: updateData }, { runValidators: true, new: true })
        if (!punishment) {
            return next(new NotFoundError("Punishment not found"))
        }
        if (punishment.status !== 'active') {
            return next(new BadRequestError("Only active punishments can be updated"))
        }

        return res.status(200).json({
            success: true,
            message: "Punishment has been updated",
            punishment
        })
    } catch (error) {

        return next(new InternalServerError("Could not update punishment"))
    }
}

export const voidPunishment = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("Punishment ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const punishment = await Punishment.findOne({ _id: id })
        if (!punishment) {
            return next(new NotFoundError("Punishment not found"))
        }

        if (punishment.status === 'completed') {
            return next(new BadRequestError("Cannot void a completed punishment"))
        }

        punishment.status = 'voided';
        punishment.voidedBy = req.user._id;
        punishment.voidedAt = Date.now()
        await punishment.save()
        return res.status(200).json({
            success: true,
            message: "Punishment has been voided",
        })
    } catch (error) {
        return next(new InternalServerError("Could not void punishment"))
    }
}