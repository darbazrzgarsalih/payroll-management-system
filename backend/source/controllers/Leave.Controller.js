import mongoose from 'mongoose';
import Leave from '../models/Leave.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';

export const applyLeave = async (req, res, next) => {
    try {
        const { employeeID, leaveTypeID, startDate, endDate, reason } = req.body;
        if (!employeeID || !leaveTypeID || !startDate || !endDate) {
            return next(new BadRequestError("Employee ID, leaveTypeID, startDate, endDate required"))
        }

        if (
            !mongoose.Types.ObjectId.isValid(employeeID) ||
            !mongoose.Types.ObjectId.isValid(leaveTypeID)
        ) {
            return next(new BadRequestError("Invalid ID"))
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return next(new BadRequestError("Invalid date format"))
        }

        if (start >= end) {
            return next(new BadRequestError("Start date must be before End date"))
        }

        const overlapingEmployee = await Leave.findOne({
            employeeID,
            status: { $ne: 'rejected' },
            startDate: { $lte: end },
            endDate: { $gte: start }
        })

        if (overlapingEmployee) {
            return next(new BadRequestError("Employee already has a leave during this period"))
        }

        const MS_PERDAY = 1000 * 24 * 60 * 60;
        const totalDays = Math.ceil((end - start) / MS_PERDAY) + 1

        const leave = new Leave({
            employeeID,
            leaveTypeID,
            startDate,
            endDate,
            totalDays,
            reason: reason || "No reason",
            status: 'pending',
            createdBy: req.user._id
        })

        await leave.save()
        return res.status(201).json({
            success: true,
            message: "Leave applied successfully",
            leave
        })
    } catch (error) {
        return next(new InternalServerError("Could not apply leave"))
    }
}

export const approveLeave = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Leave ID required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const leave = await Leave.findById(id)
        if (!leave) {
            return next(new NotFoundError("Leave not found"))
        }
        if (leave.status !== 'pending') {
            return next(new BadRequestError("Only pending leaves can be approved"))
        }

        leave.status = 'approved'
        leave.approvedBy = req.user._id
        leave.approvedAt = new Date()
        await leave.save()

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const startDate = new Date(leave.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(leave.endDate);
        endDate.setHours(23, 59, 59, 999);

        
        if (now >= startDate && now <= endDate) {
            const Employee = mongoose.model('Employee');
            await Employee.findByIdAndUpdate(leave.employeeID, {
                $set: { 'employmentInfo.status': 'on_leave' }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Leave has been approved",
        })
    } catch (error) {
        console.error(error);
        return next(new InternalServerError("Could not approve leave"))
    }
}

export const rejectLeave = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const leave = await Leave.findById(id)
        if (!leave) {
            return next(new NotFoundError("Leave not found"))
        }

        if (leave.status !== 'pending') {
            return next(new BadRequestError("Only pending leaves can be rejected"))
        }

        leave.status = 'rejected'
        leave.rejectedBy = req.user._id
        leave.rejectedAt = new Date()
        await leave.save()

        return res.status(200).json({
            success: true,
            message: "Leave has been rejected",
        })
    } catch (error) {
        return next(new InternalServerError("Could not reject leave"))
    }
}

export const getEmployeeLeaves = async (req, res, next) => {
    try {
        const { employeeID } = req.params;

        if (!employeeID) {
            return next(new BadRequestError("Employee id is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(employeeID)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const leave = await Leave.find({ employeeID })
            .sort({ startDate: -1 })
        if (!leave) {
            return next(new NotFoundError("Leave not found"))
        }
        return res.status(200).json({
            success: true,
            message: "Leaves found",
            leave
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch leaves"))
    }
}

export const getAllLeaves = async (req, res, next) => {
    try {
        const { employeeID, leaveTypeID, status } = req.query;
        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 10)
        const skip = (page - 1) * limit
        let queryObject = {}
        if (employeeID) {
            queryObject.employeeID = employeeID
        }
        if (leaveTypeID) {
            queryObject.leaveTypeID = leaveTypeID
        }
        if (status) {
            queryObject.status = status
        }
        const leaves = await Leave.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('approvedBy', 'username')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')
            .populate('rejectedBy', 'username')
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName')
            .populate('leaveTypeID', 'name')
        const transformedLeave = leaves.map((l) => {
            return {
                id: l._id,
                employeeName: [
                    l.employeeID?.personalInfo?.firstName,
                    l.employeeID?.personalInfo?.middleName,
                    l.employeeID?.personalInfo?.lastName,
                ].filter(Boolean).join(" "),

                leaveType: l.leaveTypeID?.name,
                startDate: l.startDate,
                endDate: l.endDate,
                totalDays: l.totalDays,
                reason: l.reason,
                status: l.status,
            }
        })

        const total = await Leave.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Leaves found",
            total,
            totalPages: Math.ceil(total / limit),
            leaves: transformedLeave
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not fetch leaves"))
    }
}