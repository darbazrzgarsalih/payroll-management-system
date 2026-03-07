import mongoose from 'mongoose';
import Attendance from '../models/Attendance.Model.js';
import { BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from '../utils/Error.Classes.js';
import { logAudit } from '../utils/Audit.Logger.js';
import Employee from '../models/Employee.Model.js';
import Shift from '../models/Shift.Model.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const checkIn = async (req, res, next) => {
    try {
        const employeeID = req.user.employeeID || req.user._id;
        const { remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(employeeID)) {
            return next(new BadRequestError("Invalid employee ID"));
        }

        const employee = await Employee.findById(employeeID).populate('shiftId');
        if (!employee) return next(new NotFoundError("Employee not found"));
        if (!employee.shiftId) return next(new BadRequestError("No shift assigned to employee"));

        const shift = employee.shiftId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({ employeeID, date: today });
        if (existing) {
            return next(new BadRequestError("Already checked in today"));
        }

        const now = new Date();

        const shiftStart = new Date(today);
        const [startHour, startMinute] = shift.startTime.split(':');
        shiftStart.setHours(startHour, startMinute, 0, 0);

        const graceLimit = new Date(shiftStart.getTime() + (shift.gracePeriodMinutes * 60000));

        let status = "present";
        if (now > graceLimit) {
            status = "late";
        }

        const attendance = await Attendance.create({
            employeeID,
            date: today,
            timeIn: now,
            status,
            remarks,
            shiftStartSnapshot: shift.startTime,
            shiftEndSnapshot: shift.endTime,
            shiftBreakMinutesSnapshot: shift.breakMinutes,
            createdBy: req.user._id
        });

        await logAudit({
            req,
            action: 'CHECK_IN',
            entity: 'Attendance',
            entityID: attendance._id,
            newValue: attendance
        });

        return res.status(201).json({
            success: true,
            message: "Checked in successfully",
            attendance
        });

    } catch (error) {

        return next(new InternalServerError("Could not check in"));
    }
};


export const checkOut = async (req, res, next) => {
    try {
        const employeeID = req.user.employeeID || req.user._id;
        const { remarks } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ employeeID, date: today });
        if (!attendance) {
            return next(new BadRequestError("You have not checked in today"));
        }

        if (attendance.timeOut) {
            return next(new BadRequestError("Already checked out"));
        }

        let shiftStartStr = attendance.shiftStartSnapshot;
        let shiftEndStr = attendance.shiftEndSnapshot;
        let breakMinutes = attendance.shiftBreakMinutesSnapshot || 0;


        if (!shiftStartStr || !shiftEndStr) {
            const employee = await Employee.findById(employeeID).populate('shiftId');
            if (employee?.shiftId) {
                shiftStartStr = employee.shiftId.startTime;
                shiftEndStr = employee.shiftId.endTime;
                breakMinutes = employee.shiftId.breakMinutes || 0;
            } else {

                shiftStartStr = "09:00";
                shiftEndStr = "17:00";
            }
        }

        const shiftStart = new Date(attendance.date);
        const [startHour, startMinute] = shiftStartStr.split(':');
        shiftStart.setHours(+startHour, +startMinute, 0, 0);

        const shiftEnd = new Date(attendance.date);
        const [endHour, endMinute] = shiftEndStr.split(':');
        shiftEnd.setHours(+endHour, +endMinute, 0, 0);

        const shiftDurationMs = shiftEnd - shiftStart - (breakMinutes * 60000);
        const timeOut = new Date();
        attendance.timeOut = timeOut;
        if (remarks) attendance.remarks = remarks;

        const workedMs = timeOut - attendance.timeIn;

        const totalHours = +(workedMs / (1000 * 60 * 60)).toFixed(2);
        const regularHours = Math.min(workedMs, shiftDurationMs) / (1000 * 60 * 60);
        const overtimeHours = Math.max(workedMs - shiftDurationMs, 0) / (1000 * 60 * 60);

        attendance.totalHours = +totalHours.toFixed(2);
        attendance.regularHours = +regularHours.toFixed(2);
        attendance.overtimeHours = +overtimeHours.toFixed(2);

        if (attendance.status !== "late") {
            if (workedMs < shiftDurationMs / 2) {
                attendance.status = "half_day";
            } else {
                attendance.status = "present";
            }
        }

        await attendance.save();


        if (overtimeHours > 0 && attendance.status !== 'late') {
            try {
                const activePayroll = await mongoose.model('Payroll').findOne({
                    status: 'draft',
                    'payPeriod.startDate': { $lte: attendance.date },
                    'payPeriod.endDate': { $gte: attendance.date }
                });

                await mongoose.model('Overtime').create({
                    employeeID: attendance.employeeID,
                    date: attendance.date,
                    hours: attendance.overtimeHours,
                    rate: 8,
                    multiplier: 1.25,
                    payrollID: activePayroll ? activePayroll._id : undefined,
                    status: 'pending',
                    remarks: "Automatically created from attendance check-out overtime",
                    createdBy: req.user._id
                });
            } catch (otError) {
                console.error("[checkOut] Failed to auto-create overtime:", otError);
            }
        }

        await logAudit({
            req,
            action: 'CHECK_OUT',
            entity: 'Attendance',
            entityID: attendance._id,
            newValue: attendance
        })

        return res.status(200).json({
            success: true,
            message: "Checked out successfully"
        });
    } catch (error) {
        return next(new InternalServerError("Could not check out"));
    }
};


export const getMyAttendance = async (req, res, next) => {
    try {
        const employeeID = req.user.employeeID || req.user._id;
        const { from, to } = req.query;

        let query = { employeeID };

        if (from && to) {
            query.date = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }

        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 30);
        const skip = (page - 1) * limit;

        const attendance = await Attendance.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')

        const total = await Attendance.countDocuments(query);

        const summary = await Attendance.aggregate([
            {
                $match: {
                    ...query,
                    employeeID: new mongoose.Types.ObjectId(employeeID)
                }
            },
            {
                $group: {
                    _id: null,
                    totalHoursWorked: { $sum: "$totalHours" },
                    totalOvertimeHours: { $sum: "$overtimeHours" },
                    presentDays: {
                        $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
                    },
                    absentDays: {
                        $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
                    },
                    halfDays: {
                        $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] }
                    }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            summary: summary[0] || {},
            attendance
        });
    } catch (error) {
        return next(new InternalServerError("Could not fetch attendance"));
    }
};


export const getAttendanceReport = async (req, res, next) => {
    try {
        const allowedRoles = ['admin', 'hr_manager', 'super_admin'];
        if (!allowedRoles.includes(req.user.role)) {
            return next(new BadRequestError("Unauthorized"));
        }

        const { employeeID, status, from, to } = req.query;
        const { search } = req.query
        let query = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            const employees = await mongoose.model('Employee').find({
                $or: [
                    { 'personalInfo.firstName': regex },
                    { 'personalInfo.lastName': regex },
                    { employeeCode: regex }
                ]
            }).select('_id');
            const employeeIds = employees.map(emp => emp._id);
            query.employeeID = { $in: employeeIds };
        }

        if (employeeID) {
            if (!mongoose.Types.ObjectId.isValid(employeeID)) {
                return next(new BadRequestError("Invalid employee ID"));
            }
            query.employeeID = employeeID;
        }

        if (status) query.status = status;

        if (from && to) {
            query.date = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }

        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);
        const skip = (page - 1) * limit;

        const attendances = await Attendance.find(query)
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName employeeCode')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Attendance.countDocuments(query);

        const summary = await Attendance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalPresent: {
                        $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
                    },
                    totalAbsent: {
                        $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
                    },
                    totalHalfDay: {
                        $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] }
                    },
                    totalOvertimeHours: { $sum: "$overtimeHours" }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            summary: summary[0] || {},
            attendances
        });
    } catch (error) {
        return next(new InternalServerError("Could not fetch attendance report"));
    }
};


export const updateAttendance = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid attendance ID"));
        }

        const allowedFields = ['timeIn', 'timeOut', 'date', 'status', 'remarks'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        updates.updatedBy = req.user._id;

        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return next(new NotFoundError("Attendance not found"));
        }







        if (updates.timeIn || updates.timeOut) {
            const timeIn = updates.timeIn ? new Date(updates.timeIn) : attendance.timeIn;
            const timeOut = updates.timeOut ? new Date(updates.timeOut) : attendance.timeOut;

            if (timeIn && timeOut) {
                const diffMs = timeOut - timeIn;
                const totalHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);

                updates.totalHours = totalHours;
                updates.regularHours = Math.min(totalHours, 8);
                updates.overtimeHours = Math.max(totalHours - 8, 0);
            }
        }

        const updatedAttendance = await Attendance.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Attendance updated",
            updatedAttendance
        });
    } catch (error) {
        return next(new InternalServerError("Could not update attendance"));
    }
};


export const exportAttendanceCSV = async (req, res, next) => {
    try {
        const { employeeID, status, from, to, search } = req.query;
        let query = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            const employees = await mongoose.model('Employee').find({
                $or: [
                    { 'personalInfo.firstName': regex },
                    { 'personalInfo.lastName': regex },
                    { employeeCode: regex }
                ]
            }).select('_id');
            query.employeeID = { $in: employees.map(e => e._id) };
        }
        if (employeeID && mongoose.Types.ObjectId.isValid(employeeID)) {
            query.employeeID = employeeID;
        }
        if (status) query.status = status;
        if (from && to) query.date = { $gte: new Date(from), $lte: new Date(to) };

        const records = await Attendance.find(query)
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName employeeCode')
            .sort({ date: -1 })
            .limit(10000);

        const header = ['Date', 'Employee Code', 'Employee Name', 'Status', 'Check In', 'Check Out', 'Hours Worked', 'Overtime Hours'];
        const rows = records.map(a => {
            const emp = a.employeeID;
            const name = emp ? [emp.personalInfo?.firstName, emp.personalInfo?.middleName, emp.personalInfo?.lastName].filter(Boolean).join(' ') : '';
            const code = emp?.employeeCode || '';
            const date = a.date ? new Date(a.date).toISOString().split('T')[0] : '';
            const timeIn = a.timeIn ? new Date(a.timeIn).toISOString().replace('T', ' ').slice(0, 16) : '';
            const timeOut = a.timeOut ? new Date(a.timeOut).toISOString().replace('T', ' ').slice(0, 16) : '';
            return [date, code, name, a.status || '', timeIn, timeOut, a.totalHours ?? '', a.overtimeHours ?? ''].join(',');
        });

        const csv = [header.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="attendance-${Date.now()}.csv"`);
        return res.send(csv);
    } catch (error) {
        return next(new InternalServerError('Could not export attendance'));
    }
};

export const importAttendanceCSV = async (req, res, next) => {
    if (!req.file) return next(new BadRequestError("No CSV file uploaded."));

    const results = [];
    const errors = [];
    const stream = Readable.from(req.file.buffer);

    stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const session = await mongoose.startSession();
            session.startTransaction();
            let importedCount = 0;

            try {
                const employeeMap = {};

                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    const employeeCode = row.employeeCode?.trim();
                    const dateStr = row.date?.trim();
                    const timeInStr = row.timeIn?.trim();

                    if (!employeeCode || !dateStr || !timeInStr) {
                        errors.push(`Row ${i + 2}: Missing required fields (employeeCode, date, timeIn).`);
                        continue;
                    }

                    let employeeID = employeeMap[employeeCode];
                    if (!employeeID) {
                        const emp = await Employee.findOne({ employeeCode }).session(session);
                        if (!emp) {
                            errors.push(`Row ${i + 2}: Employee with code ${employeeCode} not found.`);
                            continue;
                        }
                        employeeID = emp._id;
                        employeeMap[employeeCode] = employeeID;
                    }

                    const date = new Date(dateStr);
                    date.setHours(0, 0, 0, 0);

                    if (isNaN(date.getTime())) {
                        errors.push(`Row ${i + 2}: Invalid date format for ${dateStr}.`);
                        continue;
                    }

                    const timeIn = new Date(timeInStr);
                    if (isNaN(timeIn.getTime())) {
                        errors.push(`Row ${i + 2}: Invalid timeIn format for ${timeInStr}. Expected ISO string.`);
                        continue;
                    }

                    const timeOut = row.timeOut?.trim() ? new Date(row.timeOut.trim()) : null;

                    let totalHours = 0;
                    let regularHours = 0;
                    let overtimeHours = 0;

                    if (timeOut && !isNaN(timeOut.getTime())) {
                        const diffMs = timeOut - timeIn;
                        totalHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);
                        regularHours = Math.min(totalHours, 8);
                        overtimeHours = Math.max(totalHours - 8, 0);
                    }

                    const existing = await Attendance.findOne({ employeeID, date }).session(session);
                    if (existing) {
                        errors.push(`Row ${i + 2}: Attendance already exists for ${employeeCode} on ${dateStr}.`);
                        continue;
                    }

                    await Attendance.create([{
                        employeeID,
                        date,
                        timeIn,
                        timeOut: timeOut && !isNaN(timeOut.getTime()) ? timeOut : undefined,
                        status: row.status?.trim() || 'present',
                        totalHours,
                        regularHours,
                        overtimeHours,
                        remarks: row.remarks?.trim() || 'Imported via CSV',
                        createdBy: req.user._id,
                    }], { session });

                    importedCount++;
                }

                await session.commitTransaction();
                session.endSession();

                return res.status(200).json({
                    success: errors.length === 0,
                    message: `Import complete. ${importedCount} attendance records imported. ${errors.length} errors.`,
                    errors
                });

            } catch (err) {
                await session.abortTransaction();
                session.endSession();
                console.error("Attendance CSV Import Error:", err);
                return next(new InternalServerError("Error processing CSV data: " + err.message));
            }
        });
};