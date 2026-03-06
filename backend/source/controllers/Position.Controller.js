import mongoose from 'mongoose';
import Position from '../models/Position.Model.js';
import { InternalServerError, NotFoundError, BadRequestError } from '../utils/Error.Classes.js';

export const getAllPositions = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit || 50)
        const page = Number(req.query.page || 1)
        const skip = (page - 1) * limit
        const { title, departmentID, level, status } = req.query;
        let queryObject = {}

        if (title) {
            queryObject.title = { $regex: title, $options: 'i' }
        }

        if (departmentID && mongoose.Types.ObjectId.isValid(departmentID)) {
            queryObject.departmentID = departmentID
        }

        if (level) {
            queryObject.level = level
        }

        if (status) {
            queryObject.status = status
        }

        const positions = await Position.find(queryObject)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('departmentID', 'name code')
            .populate('updatedBy', 'username')
            .populate('createdBy', 'username')

        const transformedPosition = positions.map((p) => {
            return {
                id: p._id,
                title: p.title,
                department: p.departmentID.name,
                level: p.level,
                description: p.description,
                status: p.status,
                createdBy: p.createdBy.username,
                updatedBy: p.createdBy.username,
            }
        })

        const total = await Position.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Positions fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            positions: transformedPosition
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not fetch positions, please try again."))
    }
}

export const getSinglePosition = async (req, res, next) => {
    try {
        const { code } = req.params;

        if (!code) {
            return next(new BadRequestError("Position code is required"))
        }

        const position = await Position.findOne({ code })
            .populate('departmentID', 'name code')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')

        if (!position) {
            return next(new NotFoundError("Position not found"))
        }

        return res.status(200).json({
            success: true,
            message: `Position found with code: ${code}`,
            position
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not fetch position, please try again."))
    }
}

export const getPositionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Position ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid position ID"))
        }

        const position = await Position.findById(id)
            .populate('departmentID', 'name code')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')

        if (!position) {
            return next(new NotFoundError("Position not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Position found",
            position
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not fetch position, please try again."))
    }
}

export const createPosition = async (req, res, next) => {
    try {
        const { title, departmentID, level, description } = req.body

        if (!title || !level) {
            return next(new BadRequestError("Title, level and departmentID are required"))
        }

        if (!mongoose.Types.ObjectId.isValid(departmentID)) {
            return next(new BadRequestError("Invalid department ID"))
        }

        const validLevels = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'Executive']
        if (!validLevels.includes(level)) {
            return next(new BadRequestError(`Invalid level. Must be one of: ${validLevels.join(', ')}`))
        }

        const existingPos = await Position.findOne({
            $or: [
                { title }
            ]
        })

        if (existingPos) {
            const field = existingPos.title === title ? 'title' : 'title'
            return next(new BadRequestError(`Position already exists with this ${field}`))
        }

        const position = new Position({
            title: title.trim(),
            departmentID,
            level,
            description: description?.trim(),
            createdBy: req.user._id,
            updatedBy: req.user._id
        })

        await position.save()

        await position.populate('departmentID', 'name')

        return res.status(201).json({
            success: true,
            message: "Position created successfully",
            position
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not create position, please try again"))
    }
}

export const updatePosition = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Position ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid position ID"))
        }

        const allowedUpdates = ['title', 'code', 'departmentID', 'level', 'description', 'status']

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

        if (updateData.departmentID && !mongoose.Types.ObjectId.isValid(updateData.departmentID)) {
            return next(new BadRequestError("Invalid department ID"))
        }

        if (updateData.level) {
            const validLevels = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'Executive']
            if (!validLevels.includes(updateData.level)) {
                return next(new BadRequestError(`Invalid level. Must be one of: ${validLevels.join(', ')}`))
            }
        }

        if (updateData.status && !['active', 'inactive'].includes(updateData.status)) {
            return next(new BadRequestError("Invalid status. Must be 'active' or 'inactive'"))
        }

        if (updateData.title || updateData.code) {
            const existingPos = await Position.findOne({
                _id: { $ne: id },
                $or: [
                    updateData.title ? { title: updateData.title } : null,
                    updateData.code ? { code: updateData.code } : null
                ].filter(Boolean)
            })

            if (existingPos) {
                const field = existingPos.code === updateData.code ? 'code' : 'title'
                return next(new BadRequestError(`Position already exists with this ${field}`))
            }
        }

        const position = await Position.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    ...updateData,
                    updatedBy: req.user._id
                }
            },
            { runValidators: true, new: true }
        ).populate('departmentID', 'name code')

        if (!position) {
            return next(new NotFoundError("Position not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Position updated successfully",
            position
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not update position, please try again"))
    }
}

export const deletePosition = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Position ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid position ID"))
        }

        const position = await Position.findByIdAndDelete(id)

        if (!position) {
            return next(new NotFoundError("Position not found"))
        }

        return res.status(200).json({
            success: true,
            message: `Position "${position.title}" has been deleted`
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not delete position, please try again"))
    }
}