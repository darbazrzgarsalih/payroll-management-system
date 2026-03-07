import mongoose from 'mongoose';
import Overtime from '../models/Overtime.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';

export const createOvertime = async (req, res, next) => {
    try {
        const { employeeID, date, hours, rate, payrollID } = req.body;
        if (!employeeID || !date || !hours || !rate || !payrollID) {
            return next(new BadRequestError("EmployeeId, date, hours, rate and payrollID are required"))
        }

        const multiplier = 1.25;
        const amount = hours * rate * multiplier;

        const overtime = new Overtime({
            employeeID,
            date,
            hours,
            rate,
            amount,
            payrollID,
            createdBy: req.user._id
        })

        await overtime.save()

        return res.status(201).json({
            success: true,
            message: "Overtime created",
            overtime
        })
    } catch (error) {

        return next(new InternalServerError("Could not create overtime"))
    }
}

export const getAllOvertimes = async (req, res, next) => {
    try {
        const { employeeID, payrollID, status, search } = req.query;
        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 15)
        const skip = (page - 1) * limit
        let queryObject = {}

        if (search) {
            const regex = new RegExp(search, 'i');
            const employees = await mongoose.model('Employee').find({
                $or: [
                    { 'personalInfo.firstName': regex },
                    { 'personalInfo.lastName': regex },
                    { employeeCode: regex }
                ]
            }).select('_id');
            queryObject.employeeID = { $in: employees.map(e => e._id) };
        }

        if (employeeID && !mongoose.Types.ObjectId.isValid(employeeID)) {
            return next(new BadRequestError("Invalid employee ID"))
        }

        if (payrollID && !mongoose.Types.ObjectId.isValid(payrollID)) {
            return next(new BadRequestError("Invalid payroll ID"))
        }

        if (employeeID) {
            queryObject.employeeID = employeeID
        }

        if (payrollID) {
            queryObject.payrollID = payrollID
        }

        if (status) {
            queryObject.status = status
        }

        const overtimes = await Overtime.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName')
            .populate('payrollID', 'payrollCode')


        const formatted = overtimes.map((o) => ({
            id: o._id,
            employeeName: o.employeeID
                ? [o.employeeID.personalInfo.firstName, o.employeeID.personalInfo.middleName, o.employeeID.personalInfo.lastName].filter(Boolean).join(' ')
                : "—",
            payrollName: o.payrollID?.payrollCode || "N/A",
            date: o.date,
            hours: o.hours,
            rate: o.rate,
            multiplier: o.multiplier,
            amount: o.amount,
            status: o.status,
        }))


        const total = await Overtime.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Overtimes fonud",
            total,
            totalPages: Math.ceil(total / limit),
            overtimes: formatted
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch overtimes"))
    }
}

export const getSingleOvertime = async (req, res, next) => {
    try {
        const { employeeID, payrollID } = req.params;

        if (!employeeID || !payrollID) {
            return next(new BadRequestError("EmployeeID and payrollID are required"))
        }

        if (!mongoose.Types.ObjectId.isValid(employeeID) || !mongoose.Types.ObjectId.isValid(payrollID)) {
            return next(new BadRequestError("Invalid ID"))
        }
        const overtime = Overtime.findOne({
            employeeID,
            payrollID
        })
        if (!overtime) {
            return next(new NotFoundError("Overtime not found"))
        }

        res.status(200).json({
            success: true,
            message: "Overtime found",
            overtime
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch overtime"))
    }
}

export const updateOvertime = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body
        if (!id) {
            return next(new BadRequestError("Overtime ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const allowedUpdates = [
            'date',
            'hours',
            'rate',
            'multiplier'
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

        const overtime = await Overtime.findOneAndUpdate({ _id: id }, { $set: updateData }, { runValidators: true, new: true })
        if (!overtime) {
            return next(new NotFoundError("Overtime not found"))
        }
        if (overtime.status !== 'pending') {
            return next(new BadRequestError("Only pending overtime can be updated"))
        }

        if (
            updateData.hours !== undefined ||
            updateData.rate !== undefined ||
            updateData.multiplier !== undefined
        ) {
            const hours = updateData.hours ?? overtime.hours;
            const rate = updateData.rate ?? overtime.rate
            const multiplier = updateData.multiplier ?? overtime.multiplier
            const amount = hours * rate * multiplier
        }


        updateData.updatedBy = req.user._id

        await overtime.save()

        return res.status(200).json({
            success: true,
            message: "Overtime has been updated"
        })
    } catch (error) {
        return next(new InternalServerError("Could not update overtime"))
    }
}

export const voidOvertime = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Overtime id is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const overtime = await Overtime.findOne({ _id: id })

        if (!overtime) {
            return next(new NotFoundError("Overtime not found"))
        }
        if (overtime.status === 'paid') {
            return next(new BadRequestError("Cannot void a paid overtime"))
        }
        overtime.status = 'voided'
        overtime.voidedAt = Date.now()
        overtime.voidedBy = req.user._id

        await overtime.save()

        return res.status(200).json({
            success: true,
            message: "Overtime has been voided"
        })

    } catch (error) {
        return next(new InternalServerError("Could not void overtime"))
    }
}