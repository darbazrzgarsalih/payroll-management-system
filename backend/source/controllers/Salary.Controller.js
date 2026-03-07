import mongoose from 'mongoose';
import Salary from '../models/Salary.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';
import { logAudit } from '../utils/Audit.Logger.js';

const allowedFields = ['salaryType', 'amount', 'currency', 'effectiveDate', 'payGradeID', 'status', 'endDate'];

export const createSalary = async (req, res, next) => {
    try {
        const { employeeID, salaryType, amount, currency, effectiveDate, payGradeID } = req.body;

        if (!employeeID || !salaryType || !amount || !currency || !effectiveDate || !payGradeID) {
            return next(new BadRequestError("EmployeeID, salaryType, amount, currency, effectiveDate and payGradeID are required."));
        }

        if (!mongoose.Types.ObjectId.isValid(employeeID)) {
            return next(new BadRequestError("Invalid employee ID."));
        }

        if (!mongoose.Types.ObjectId.isValid(payGradeID)) {
            return next(new BadRequestError("Invalid pay grade ID."));
        }

        if (isNaN(amount) || amount <= 0) {
            return next(new BadRequestError("Amount must be a number greater than 0."));
        }

        const validSalaryTypes = ['hourly', 'monthly', 'daily'];
        if (!validSalaryTypes.includes(salaryType)) {
            return next(new BadRequestError(`Invalid salary type. Must be one of: ${validSalaryTypes.join(', ')}`));
        }

        const validCurrencies = ['USD'];
        if (!validCurrencies.includes(currency)) {
            return next(new BadRequestError(`Invalid currency. Must be USD`));
        }

        if (isNaN(Date.parse(effectiveDate))) {
            return next(new BadRequestError("Invalid effectiveDate format"));
        }

        const existingSalary = await Salary.findOne({
            employeeID,
            status: 'active'
        });

        if (existingSalary) {
            return next(new BadRequestError("Employee already has an active salary. Deactivate the current salary first."));
        }

        const salary = new Salary({
            employeeID,
            salaryType,
            amount,
            currency,
            effectiveDate: new Date(effectiveDate),
            payGradeID,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });



        await salary.save();

        await salary.populate('employeeID', 'personalInfo.firstName personalInfo.lastName employeeCode');
        await salary.populate('payGradeID', 'name code');

        return res.status(201).json({
            success: true,
            message: "Salary created successfully.",
            salary
        });

    } catch (error) {
        console.error(error);
        return next(new InternalServerError("Could not create salary, please try again."));
    }
};

export const getSalaries = async (req, res, next) => {
    try {
        const { employeeID, salaryType, payGradeID, status } = req.query;
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);
        const skip = (page - 1) * limit;

        const queryObject = {};

        if (employeeID && mongoose.Types.ObjectId.isValid(employeeID)) {
            queryObject.employeeID = employeeID;
        }

        if (salaryType) {
            queryObject.salaryType = salaryType;
        }

        if (payGradeID && mongoose.Types.ObjectId.isValid(payGradeID)) {
            queryObject.payGradeID = payGradeID;
        }

        if (status) {
            queryObject.status = status;
        }

        const salaries = await Salary.find(queryObject)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('employeeID', 'personalInfo.firstName personalInfo.lastName employeeCode')
            .populate('payGradeID', 'name code')
            .populate('createdBy', 'username role')
            .populate('updatedBy', 'username role')

        const transformedSalary = salaries.map((s) => {
            const firstName = s.employeeID?.personalInfo?.firstName || "";
            const middleName = s.employeeID?.personalInfo?.middleName || "";
            const lastName = s.employeeID?.personalInfo?.lastName || "";

            return {
                id: s._id.toString(),
                employeeName: [firstName, middleName, lastName].filter(Boolean).join(" ") || "Unknown Employee",
                amount: s.amount,
                salaryType: s.salaryType,
                currency: s.currency,
                effectiveDate: s.effectiveDate,
                endDate: s.endDate,
                payGrade: s.payGradeID?.name || "N/A",
                status: s.status,
                createdBy: s.createdBy?.username || "System"
            }
        })

        const total = await Salary.countDocuments(queryObject);

        return res.status(200).json({
            success: true,
            message: "Salaries fetched successfully.",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            salaries: transformedSalary
        });
    } catch (error) {
        console.error(error);
        return next(new InternalServerError("Could not fetch salaries, please try again."));
    }
};

export const getSingleSalary = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) return next(new BadRequestError("Salary ID is required."));
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid Salary ID."));

        const salary = await Salary.findById(id)
            .populate('employeeID', 'personalInfo.firstName personalInfo.lastName employeeCode')
            .populate('payGradeID', 'name code')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username');

        if (!salary) return next(new NotFoundError("Salary not found."));

        return res.status(200).json({
            success: true,
            message: "Salary fetched successfully.",
            salary
        });
    } catch (error) {
        console.error(error);
        return next(new InternalServerError("Could not fetch salary, please try again."));
    }
};

export const updateSalary = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) return next(new BadRequestError("Salary ID is required."));
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid Salary ID."));
        if (!updates || Object.keys(updates).length === 0) return next(new BadRequestError("No update data provided."));

        const filteredUpdates = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined && updates[field] !== '') {
                filteredUpdates[field] = updates[field];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            return next(new BadRequestError("No valid update fields provided."));
        }

        if (filteredUpdates.payGradeID && !mongoose.Types.ObjectId.isValid(filteredUpdates.payGradeID)) {
            return next(new BadRequestError("Invalid pay grade ID."));
        }

        if (filteredUpdates.amount && (isNaN(filteredUpdates.amount) || filteredUpdates.amount <= 0)) {
            return next(new BadRequestError("Amount must be a number greater than 0."));
        }

        if (filteredUpdates.salaryType) {
            const validSalaryTypes = ['hourly', 'monthly', 'daily'];
            if (!validSalaryTypes.includes(filteredUpdates.salaryType)) {
                return next(new BadRequestError(`Invalid salary type. Must be one of: ${validSalaryTypes.join(', ')}`));
            }
        }

        if (filteredUpdates.currency) {
            const validCurrencies = ['USD'];
            if (!validCurrencies.includes(filteredUpdates.currency)) {
                return next(new BadRequestError(`Invalid currency. Must be USD`));
            }
        }

        if (filteredUpdates.status && !['active', 'inactive'].includes(filteredUpdates.status)) {
            return next(new BadRequestError("Invalid status. Must be 'active' or 'inactive'."));
        }

        filteredUpdates.updatedBy = req.user._id;

        const salary = await Salary.findOneAndUpdate(
            { _id: id },
            { $set: filteredUpdates },
            { runValidators: true, new: true }
        )
            .populate('employeeID', 'personalInfo.firstName personalInfo.lastName employeeCode')
            .populate('payGradeID', 'name code');

        if (!salary) return next(new NotFoundError("Salary not found."));

        await logAudit({
            req,
            action: 'UPDATE',
            entity: 'Salary',
            entityID: salary._id,
            newValue: salary
        })
        return res.status(200).json({
            success: true,
            message: "Salary updated successfully.",
            salary
        });


    } catch (error) {
        console.error(error);
        return next(new InternalServerError("Could not update salary, please try again."));
    }
};

export const deleteSalary = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) return next(new BadRequestError("Salary ID is required."));
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid Salary ID."));

        const salary = await Salary.findByIdAndDelete(id);

        if (!salary) return next(new NotFoundError("Salary not found."));

        return res.status(200).json({
            success: true,
            message: "Salary deleted successfully."
        });
    } catch (error) {
        console.error(error);
        return next(new InternalServerError("Could not delete salary, please try again."));
    }
};