import PayGrade from "../models/PayGrade.Model.js";
import { BadRequestError, InternalServerError } from "../utils/Error.Classes.js";
import mongoose from "mongoose";


export const createPayGrade = async (req, res, next) => {
    try {
        const { name, level, minSalary, maxSalary, currency } = req.body;

        if (!name  || !level || !minSalary || !maxSalary || !currency) {
            return next(new BadRequestError("Name, level, min salary, max salary and currency required"))
        }

        if (Number(minSalary) >= Number(maxSalary)) {
            return next(new BadRequestError("minSalary must be less than maxSalary."))
        }

        const existingPayGrade = await PayGrade.findOne({ name })
        if (existingPayGrade) {
            return next(new BadRequestError("Pay grade already exists."))
        }

        const paygrade = new PayGrade({
            name,
            level,
            minSalary,
            maxSalary,
            currency,
            createdBy: req.user_id,
            updatedBy: req.user._id
        })

        await paygrade.save()

        return res.status(201).json({
            success: true,
            message: "Pay grade created successfully",
            paygrade
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not create paygrade, please try again."))
    }
}

export const getAllPayGrades = async (req, res, next) => {
    try {
        const { name, code } = req.query;
        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 20)
        const skip = (page - 1) * limit
        let queryObject = {}

        if (name) {
            queryObject.name = { $regex: name, $options: 'i' }
        }

        if (code) {
            queryObject.code = { $regex: code, $options: 'i' }
        }

        const paygrades = await PayGrade.find(queryObject).sort({ createdAt: -1 }).limit(limit).skip(skip).populate('updatedBy', 'username')
            .populate('createdBy', 'username')

        const total = await PayGrade.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Paygrades found",
            total,
            totalPages: Math.ceil(total / limit),
            paygrades
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch paygrades, please try again."))
    }
}

export const updatePayGrade = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            return next(new BadRequestError("PayGrade ID is required."));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid PayGrade ID."));
        }

        if (Object.keys(updates).length === 0) {
            return next(new BadRequestError("No update data provided."));
        }

        const paygrade = await PayGrade.findByIdAndUpdate(
            id,
            { $set: updates },
            { runValidators: true, new: true }
        );

        if (!paygrade) {
            return next(new BadRequestError("PayGrade not found."));
        }

        return res.status(200).json({
            success: true,
            message: "PayGrade updated successfully.",
            paygrade
        });
    } catch (error) {
        return next(new InternalServerError("Could not update paygrade, please try again."));
    }
};


export const deletePayGrade = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("PayGrade ID is required."));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid PayGrade ID."));
        }

        const paygrade = await PayGrade.findByIdAndDelete(
            id,
        );

        if (!paygrade) {
            return next(new BadRequestError("PayGrade not found."));
        }

        return res.status(200).json({
            success: true,
            message: "PayGrade deleted successfully."
        });
    } catch (error) {
        return next(new InternalServerError("Could not delete paygrade, please try again."));
    }
};

