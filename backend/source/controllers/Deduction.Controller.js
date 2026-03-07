import mongoose from 'mongoose';
import Deduction from '../models/Deduction.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';

export const createDeduction = async (req, res, next) => {
    try {
        const { employeeID, type, name, amount, frequency, startDate, endDate } = req.body;

        if (!employeeID || !name || !frequency || !startDate || !endDate || !type || !amount) {
            return next(new BadRequestError("employeeID, name, amount, frequency, startDate, type and endDate are required fields"))
        }
        if (amount === undefined || amount === null || Number(amount) <= 0) {
            return next(new BadRequestError("Amount must be greater than zero"))
        }
        if (!mongoose.Types.ObjectId.isValid(employeeID)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const existingDeduction = await Deduction.findOne({
            employeeID,
            name,
            status: { $ne: 'voided' }
        })

        if (existingDeduction) {
            return next(new BadRequestError("Deduction already exists with this name"))
        }


        if (new Date(startDate) >= new Date(endDate)) {
            return next(new BadRequestError("Start date must be before end date"))
        }

        const deduction = new Deduction({
            employeeID,
            type,
            name,
            amount,
            frequency,
            startDate,
            endDate,
            totalAmount: amount,
            remainingAmount: amount,
            createdBy: req.user._id,
        })

        await deduction.save()

        return res.status(201).json({
            success: true,
            message: "Deduction created",
            deduction
        })
    } catch (error) {
        return next(new InternalServerError("Could not create deduction"))
    }
}

export const getAllDeductions = async (req, res, next) => {
    try {
        const { name, employeeID, type, calculationType, status } = req.query;
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);
        const skip = (page - 1) * limit;

        let queryObject = {}
        if (name) {
            queryObject.name = { $regex: name, $options: 'i' }
        }

        if (type) {
            queryObject.type = { $regex: type, $options: 'i' }
        }

        if (calculationType) {
            queryObject.calculationType = { $regex: calculationType, $options: 'i' }
        }


        if (status) {
            queryObject.status = status
        }

        if (employeeID) {
            if (!mongoose.Types.ObjectId.isValid(employeeID)) {
                return next(new BadRequestError("Invalid ID"))
            }
            queryObject.employeeID = employeeID
        }

        const deductions = await Deduction.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName')

        const transformedDeduction = deductions.map((d) => {
            const firstName = d.employeeID?.personalInfo?.firstName || "";
            const middleName = d.employeeID?.personalInfo?.middleName || "";
            const lastName = d.employeeID?.personalInfo?.lastName || "";

            return {
                id: d._id.toString(),
                employeeName: [firstName, middleName, lastName].filter(Boolean).join(" ") || "Unknown Employee",
                type: d.type,
                name: d.name,
                amount: d.amount,
                percentage: d.percentage,
                calculationType: d.calculationType,
                frequency: d.frequency,
                startDate: d.startDate,
                endDate: d.endDate,
                totalAmount: d.totalAmount || d.amount,
                remainingAmount: d.remainingAmount !== undefined ? d.remainingAmount : d.amount,
                status: d.status
            }
        })
        const total = await Deduction.countDocuments(queryObject)
        return res.status(200).json({
            success: true,
            message: "Deductions found",
            total,
            totalPages: Math.ceil(total / limit),
            deductions: transformedDeduction
        })
    } catch (error) {

        return next(new InternalServerError("Could not fetch deductions"))
    }
}

export const getSingleDeduction = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const deduction = await Deduction.findById(id)
        if (!deduction) {
            return next(new NotFoundError("Deduction not found"))
        }
        return res.status(200).json({
            success: true,
            message: "Deduction found",
            deduction
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch deduction"))
    }
}

export const updateDeduction = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const allowedUpdates = [
            'type',
            'name',
            'amount',
            'frequency',
            'startDate',
            'endDate'
        ]

        const buildUpdateObj = (updates, allowedFields) => {
            let updateObj = {}
            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateObj[field] = updates[field]
                }
            }
            return updateObj
        }

        const updateData = buildUpdateObj(req.body, allowedUpdates)
        updateData.updatedBy = req.user._id;
        const deduction = await Deduction.findOneAndUpdate({ _id: id }, { $set: updateData }, { runValidators: true, new: true })
        if (!deduction) {
            return next(new NotFoundError("Deduction not found"))
        }
        return res.status(200).json({
            success: true,
            message: "Deduction has been updated",
            deduction
        })
    } catch (error) {
        return next(new InternalServerError("Could not update deduction"))
    }
}

export const voidDeduction = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return next(new BadRequestError("Deduction ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const deduction = await Deduction.findById(id)
        if (!deduction) {
            return next(new NotFoundError("Deduction not found"))
        }

        if (deduction.status !== 'active') {
            return next(new BadRequestError("Only active deductions can be voided"))
        }

        deduction.status = 'voided'
        deduction.voidedBy = req.user._id
        deduction.voidedAt = Date.now()
        deduction.updatedBy = req.user._id
        await deduction.save()

        return res.status(200).json({
            success: true,
            message: "Deduction has been voided",
        })
    } catch (error) {
        return next(new InternalServerError("Could not void deduction"))
    }
}