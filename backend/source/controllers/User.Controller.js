import User from "../models/User.Model.js";
import bcrypt from 'bcrypt'
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/Error.Classes.js";
import mongoose from "mongoose";

export const createUser = async (req, res, next) => {
    try {
        const { username, firstName, lastName, email, password, role, employeeID } = req.body

        if (!username || !firstName || !lastName || !email || !password || !role) {
            return next(new BadRequestError("Username, firstname, lastname, email, role, and password are required."))
        }

        const existingUser = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        })

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username'
            return next(new BadRequestError(`User already exists with this ${field}.`))
        }

        if (password.length < 8) {
            return next(new BadRequestError("Password must contain at least 8 characters."))
        }

        if (username.length < 4) {
            return next(new BadRequestError("Username must be 4 or more characters long."))
        }

        const validRoles = ['super_admin', 'admin', 'hr_manager', 'leave_manager', 'payroll_manager', 'overtime_manager', 'punishment_manager', 'employee']
        if (!validRoles.includes(role)) {
            return next(new BadRequestError(`Invalid role. Must be one of: ${validRoles.join(', ')}`))
        }

        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new User({
            username: username.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            avatar: req.file ? `documents/users/${req.file.filename}` : undefined,
            role,
            createdBy: req.user._id,
            updatedBy: req.user._id,
            employeeID: employeeID
        })

        await user.save()

        return res.status(201).json({
            success: true,
            message: `User created successfully, ${user.username}`,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status
            }
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not create user, please try again."))
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const sort = '-createdAt';
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);
        const skip = (page - 1) * limit;
        const { username, firstName, lastName, email, role, status } = req.query

        let queryObject = {}

        if (username) {
            queryObject.username = { $regex: username, $options: 'i' }
        }

        if (firstName) {
            queryObject.firstName = { $regex: firstName, $options: 'i' }
        }

        if (lastName) {
            queryObject.lastName = { $regex: lastName, $options: 'i' }
        }

        if (email) {
            queryObject.email = { $regex: email, $options: 'i' }
        }

        if (role) {
            queryObject.role = role
        }

        if (status) {
            queryObject.status = status
        }

        const users = await User.find(queryObject)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('updatedBy', 'username')
            .populate('createdBy', 'username')
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName')
            .select('-password')

        const transformedUsers = users.map((u) => {
            return {
                id: u._id.toString(),
                username: u.username,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                role: u.role,
                lastLogin: u.lastLogin,
                status: u.status,
                avatar: u.avatar,
                employeeName: [
                    u.employeeID?.personalInfo.firstName,
                    u.employeeID?.personalInfo.middleName,
                    u.employeeID?.personalInfo.lastName,
                ].filter(Boolean).join(" ")
            }
        })

        const total = await User.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            users: transformedUsers
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not fetch users, please try again."))
    }
}

export const getSingleUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("User ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid user ID"))
        }

        const user = await User.findById(id)
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')
            .select('-password')

        if (!user) {
            return next(new NotFoundError("User not found."))
        }

        return res.status(200).json({
            success: true,
            message: `User found`,
            user
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not fetch user, please try again."))
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;

        if (!id) {
            return next(new BadRequestError("User ID is required."))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid user ID."))
        }

        const allowedUpdates = ['username', 'firstName', 'lastName', 'email']

        const buildUpdateObj = (updates, allowedFields) => {
            let updateObj = {}
            for (const field of allowedFields) {
                if (updates[field] !== undefined && updates[field] !== '') {
                    updateObj[field] = typeof updates[field] === 'string'
                        ? updates[field].trim()
                        : updates[field]
                }
            }
            return updateObj
        }

        let updateData = buildUpdateObj(req.body, allowedUpdates)

        if (req.file) {
            updateData.avatar = `documents/users/${req.file.filename}`
        }

        if (Object.keys(updateData).length === 0) {
            return next(new BadRequestError("No valid update data provided"))
        }

        if (updateData.username || updateData.email) {
            const existingUser = await User.findOne({
                _id: { $ne: id },
                $or: [
                    updateData.username ? { username: updateData.username } : null,
                    updateData.email ? { email: updateData.email } : null
                ].filter(Boolean)
            })

            if (existingUser) {
                const field = existingUser.email === updateData.email ? 'email' : 'username'
                return next(new BadRequestError(`${field} already exists.`))
            }
        }

        const user = await User.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    ...updateData,
                    updatedBy: req.user._id
                }
            },
            { runValidators: true, new: true }
        ).select('-password')

        if (!user) {
            return next(new NotFoundError("User not found."))
        }

        return res.status(200).json({
            success: true,
            message: `User updated successfully.`,
            user
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not update user, please try again."))
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("User ID is required."))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid user ID."))
        }

        if (id === req.user._id.toString()) {
            return next(new BadRequestError("You cannot delete your own account."))
        }

        const user = await User.findOneAndDelete({ _id: id })

        if (!user) {
            return next(new NotFoundError("User not found."))
        }

        return res.status(200).json({
            success: true,
            message: `User ${user.username} has been deleted.`
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not delete user, please try again."))
    }
}

export const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!id) {
            return next(new BadRequestError("User ID is required."))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid user ID."))
        }

        if (!status) {
            return next(new BadRequestError("Status is required."))
        }

        const validStatuses = ['active', 'inactive']
        if (!validStatuses.includes(status)) {
            return next(new BadRequestError("Invalid status. Must be 'active' or 'inactive'."))
        }

        if (id === req.user._id.toString() && status === 'inactive') {
            return next(new BadRequestError("You cannot deactivate your own account."))
        }

        const user = await User.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    status,
                    updatedBy: req.user._id
                }
            },
            { runValidators: true, new: true }
        ).select('-password')

        if (!user) {
            return next(new NotFoundError("User not found."))
        }

        return res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            user
        })

    } catch (error) {
        
        return next(new InternalServerError("Could not update user status, please try again."))
    }
}

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body

        if (!id) {
            return next(new BadRequestError("User ID is required."))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid user ID."))
        }

        if (!role) {
            return next(new BadRequestError("Role is required."))
        }

        const validRoles = ['super_admin', 'admin', 'hr_manager', 'leave_manager', 'payroll_manager', 'overtime_manager', 'punishment_manager', 'employee']
        if (!validRoles.includes(role)) {
            return next(new BadRequestError(`Invalid role. Must be one of: ${validRoles.join(', ')}`))
        }

        if (id === req.user._id.toString()) {
            return next(new BadRequestError("You cannot change your own role."))
        }

        const user = await User.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    role,
                    updatedBy: req.user._id
                }
            },
            { runValidators: true, new: true }
        ).select('-password')

        if (!user) {
            return next(new NotFoundError("User not found"))
        }

        return res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not change user role, please try again."))
    }
}