import mongoose from "mongoose";
import SalaryComponent from "../models/SalaryComponent.Model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/Error.Classes.js";

export const createSalaryComponent = async (req, res, next) => {
    try {
        const { payGradeID, name, effectiveFrom } = req.body;
        if (!payGradeID || !name || !effectiveFrom) {
            return next(new BadRequestError("payGradeID, name and effectiveFrom required"))
        }
        const existingSalaryComponent = await SalaryComponent.findOne({ payGradeID })
        if (existingSalaryComponent) {
            return next(new BadRequestError("Salary component already exists for this pay grade"))
        }

        const salaryComponent = new SalaryComponent({
            payGradeID,
            name,
            effectiveFrom,
            createdBy: req.user._id
        })

        await salaryComponent.save()

        return res.status(201).json({
            success: true,
            message: "Salary component created successfully",
            salaryComponent
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not create salary component, please try again"))
    }
}

export const getAllSalaryComponents = async (req, res, next) => {
    try {
        const { name, code, payGradeID, status } = req.query;
        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 50)
        const skip = (page - 1) * limit;
        let queryObject = {}
        if (name) {
            queryObject.name = { $regex: name, $options: 'i' }
        }
        if (code) {
            queryObject.code = { $regex: code, $options: 'i' }
        }

        if (payGradeID) {
            if (!mongoose.Types.ObjectId.isValid(payGradeID)) {
                return next(new BadRequestError("Invalid ID"))
            }
            queryObject.payGradeID = payGradeID
        }

        if (status) {
            queryObject.status = status
        }

        const salaryComponents = await SalaryComponent.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('payGradeID', 'code name')

        const total = await SalaryComponent.countDocuments(queryObject)
        return res.status(200).json({
            success: true,
            message: "Salary Components found",
            total,
            totalPages: Math.ceil(total / limit),
            salaryComponents
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch salary components"))
    }
}

export const updateSalaryComponent = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const allowedUpdates = [
            'name',
            'type',
            'category',
            'value',
            'description'
        ]

        const buildUpdateObject = (updates, allowedFields) => {
            let updateObj = {}
            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateObj[field] = updates[field]
                }
            }
            return updateObj
        }

        const updateData = buildUpdateObject(req.body, allowedUpdates)
        updateData.updatedBy = req.user._id
        const salaryComponent = await SalaryComponent.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { runValidators: true, new: true }
        )

        if (!salaryComponent) {
            return next(new NotFoundError("Salary component not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Salary component has been updated"
        })
    } catch (error) {
        return next(new InternalServerError("Could not update salary component"))
    }
}

export const deactivateSalaryComponent = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const salaryComponent = await SalaryComponent.findOne({ _id: id })
        if (!salaryComponent) {
            return next(new NotFoundError("Salary component not found"))
        }

        salaryComponent.status = 'inactive'
        salaryComponent.updatedBy = req.user._id
        await salaryComponent.save()
        return res.status(200).json({
            success: true,
            message: "Salary component has been deactivated"
        })
    } catch (error) {
        return next(new InternalServerError("Could not deactivate salary component"))
    }
}