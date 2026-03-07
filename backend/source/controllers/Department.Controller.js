import mongoose from "mongoose";
import Department from "../models/Department.Model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/Error.Classes.js";

export const getAllDepartments = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit || 50)
        const page = Number(req.query.page || 1)
        const skip = (page - 1) * limit
        const { search, status } = req.query;

        let queryObject = {}

        if (search) {
            queryObject.$or = [
                { "name": { $regex: search, $options: "i" } },
                { "code": { $regex: search, $options: "i" } },
            ]
        }

        if (status) {
            queryObject["status"] = status
        }
        const departments = await Department.find(queryObject)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('updatedBy', 'username')
            .populate('createdBy', 'username')

        const total = await Department.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Departments fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            departments
        })

    } catch (error) {

        return next(new InternalServerError("Could not fetch departments, please try again."))
    }
}

export const getSingleDepartment = async (req, res, next) => {
    try {
        const { code } = req.params;

        if (!code) {
            return next(new BadRequestError("Department Code is required"))
        }

        const department = await Department.findOne({ code })
            .populate('managerID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName employeeCode')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')

        if (!department) {
            return next(new NotFoundError("Department not found"))
        }

        return res.status(200).json({
            success: true,
            message: `Department found with code: ${code}`,
            department
        })

    } catch (error) {

        return next(new InternalServerError("Could not fetch department, please try again."))
    }
}

export const getDepartmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Department ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid department ID"))
        }

        const department = await Department.findById(id)
            .populate('managerID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName employeeCode')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')

        if (!department) {
            return next(new NotFoundError("Department not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Department found",
            department
        })

    } catch (error) {

        return next(new InternalServerError("Could not fetch department, please try again."))
    }
}

export const createDepartment = async (req, res, next) => {
    try {
        const { name, budget } = req.body

        if (!name) {
            return next(new BadRequestError("Name is required"))
        }


        const existingDep = await Department.findOne({
            $or: [
                { name }
            ]
        })

        if (existingDep) {
            const field = existingDep.name === name ?? 'name'
            return next(new BadRequestError(`Department already exists with this ${field}`))
        }

        const department = new Department({
            name: name.trim(),
            budget: budget || undefined,
            createdBy: req.user._id,
            updatedBy: req.user._id
        })

        await department.save()



        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        })
    } catch (error) {

        return next(new InternalServerError("Could not create department, please try again"))
    }
}

export const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Department ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid department ID"))
        }

        const allowedUpdates = ['name', 'budget', 'status']

        const buildUpdateObject = (updates, allowedFields) => {
            const updateObj = {}
            for (const field of allowedFields) {
                if (updates[field] !== undefined && updates[field] !== '') {
                    updateObj[field] = typeof updates[field] === 'string'
                        ? updates[field].trim()
                        : updates[field]
                }
            }
            return updateObj
        }

        const updateData = buildUpdateObject(req.body, allowedUpdates)

        if (Object.keys(updateData).length === 0) {
            return next(new BadRequestError("No valid update data provided"))
        }



        if (updateData.status && !['active', 'inactive'].includes(updateData.status)) {
            return next(new BadRequestError("Invalid status. Must be 'active' or 'inactive'"))
        }

        if (updateData.name || updateData.code) {
            const existingDep = await Department.findOne({
                _id: { $ne: id },
                $or: [
                    updateData.name ? { name: updateData.name } : null,
                    updateData.code ? { code: updateData.code } : null
                ].filter(Boolean)
            })

            if (existingDep) {
                const field = existingDep.code === updateData.code ? 'code' : 'name'
                return next(new BadRequestError(`Department already exists with this ${field}`))
            }
        }

        const department = await Department.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    ...updateData,
                    updatedBy: req.user._id
                }
            },
            { runValidators: true, new: true }
        ).populate('updatedBy', 'username')

        if (!department) {
            return next(new NotFoundError("Department not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department
        })

    } catch (error) {

        return next(new InternalServerError("Could not update department, please try again"))
    }
}

export const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Department ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid department ID"))
        }

        const department = await Department.findByIdAndDelete(id)

        if (!department) {
            return next(new NotFoundError("Department not found"))
        }

        return res.status(200).json({
            success: true,
            message: `Department "${department.name}" has been deleted`
        })
    } catch (error) {

        return next(new InternalServerError("Could not delete department, please try again"))
    }
}