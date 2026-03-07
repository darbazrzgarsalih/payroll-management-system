import mongoose from 'mongoose';
import Payroll from '../models/Payroll.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';
import Employee from '../models/Employee.Model.js';
import Salary from '../models/Salary.Model.js';
import SalaryComponent from '../models/SalaryComponent.Model.js';
import PayrollItem from '../models/PayrollItem.Model.js';
import Overtime from '../models/Overtime.Model.js';
import Reward from '../models/Reward.Model.js';
import Punishment from '../models/Punishment.Model.js';
import Deduction from '../models/Deduction.Model.js';
import { logAudit } from '../utils/Audit.Logger.js';


export const createPayrollRun = async (req, res, next) => {
    try {
        const { payrollCode, startDate, endDate, payDate } = req.body;

        if (!payrollCode || !startDate || !endDate || !payDate) {
            return next(new BadRequestError("PayrollCode, startDate, endDate, and payDate are required"))
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const pay = new Date(payDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(pay.getTime())) {
            return next(new BadRequestError("Invalid date format"))
        }

        if (start >= end) {
            return next(new BadRequestError("Start date must be before end date"))
        }

        if (pay < end) {
            return next(new BadRequestError("Pay date must be on or after end date"))
        }

        const existingPayrollRun = await Payroll.findOne({
            $or: [
                { payrollCode },
                {
                    $and: [
                        { 'payPeriod.startDate': { $lte: end } },
                        { 'payPeriod.endDate': { $gte: start } }
                    ]
                }
            ]
        })

        if (existingPayrollRun) {
            const reason = existingPayrollRun.payrollCode === payrollCode
                ? 'payroll code'
                : 'overlapping period'
            return next(new BadRequestError(`Payroll already exists with this ${reason}`))
        }

        const payroll = new Payroll({
            payrollCode: payrollCode.trim(),
            payPeriod: {
                startDate: start,
                endDate: end,
                payDate: pay
            },
            createdBy: req.user._id,
            updatedBy: req.user._id
        })

        await logAudit({
            req,
            action: 'RUN_PAYROLL',
            entity: 'Payroll',
            entityID: payroll._id,
            newValue: payroll
        })

        await payroll.save()

        return res.status(201).json({
            success: true,
            message: `Payroll created with status: ${payroll.status}`,
            payroll
        })
    } catch (error) {

        return next(new InternalServerError("Could not create payroll, please try again"))
    }
}


export const generatePayrollItems = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) return next(new BadRequestError("Payroll ID is required"));
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid payroll ID"));

        const payroll = await Payroll.findById(id);
        if (!payroll) return next(new NotFoundError("Payroll not found"));
        if (payroll.status !== 'draft') return next(new BadRequestError("Payroll must be in draft status"));

        const existingItems = await PayrollItem.find({ payrollID: payroll._id });
        if (existingItems.length > 0) {
            return next(new BadRequestError("Payroll items already generated for this payroll"))
        }

        const employees = await Employee.find({ 'employmentInfo.status': 'active' });
        if (!employees.length) return next(new NotFoundError("No active employees found"));

        let itemsCreated = 0;

        for (const employee of employees) {
            const salary = await Salary.findOne({ employeeID: employee._id });
            if (!salary) continue;

            const components = await SalaryComponent.find({
                payGradeID: salary.payGradeID,
                status: 'active'
            });

            const componentBreakdown = components.map(c => {
                let amt = c.value || 0;
                if (c.calculationType === 'percentage' && salary.amount) {
                    amt = (salary.amount * c.value) / 100;
                }
                return {
                    componentID: c._id,
                    type: c.type,
                    description: c.description || c.name || '',
                    amount: amt
                };
            });

            const rewards = await Reward.find({
                employeeID: employee._id,
                payrollID: payroll._id,
                status: { $ne: 'voided' }
            });

            const rewardsSum = rewards.reduce((acc, r) => acc + (r.amount || 0), 0);

            const overtimes = await Overtime.find({
                employeeID: employee._id,
                payrollID: payroll._id,
                status: { $ne: 'voided' }
            });

            const overtimeSum = overtimes.reduce((acc, ot) => acc + (ot.amount || 0), 0);

            const punishments = await Punishment.find({
                employeeID: employee._id,
                status: 'active',
                startDate: { $lte: payroll.payPeriod.endDate },
                $or: [
                    { endDate: { $gte: payroll.payPeriod.startDate } },
                    { endDate: { $exists: false } },
                    { endDate: null }
                ]
            })

            const deductions = await Deduction.find({
                employeeID: employee._id,
                status: 'active',
                startDate: { $lte: payroll.payPeriod.endDate },
                $or: [
                    { endDate: { $gte: payroll.payPeriod.startDate } },
                    { endDate: { $exists: false } },
                    { endDate: null }
                ]
            })

            const punishmentsSum = punishments.reduce(
                (acc, p) => {
                    let amt = p.amount || 0;
                    if (p.calculationType === 'percentage' && p.percentage) {
                        amt = (salary.amount * p.percentage) / 100;
                    }
                    return acc + amt;
                },
                0
            );

            const earningsSum = componentBreakdown
                .filter(c => c.type === 'earning')
                .reduce((acc, c) => acc + (c.amount || 0), 0);

            const componentDeductionsSum = componentBreakdown
                .filter(c => c.type === 'deduction')
                .reduce((acc, c) => acc + (c.amount || 0), 0);

            const deductionsSum = deductions.reduce((acc, d) => {
                let amt = d.amount || 0;
                if (d.calculationType === 'percentage' && d.percentage) {
                    amt = (salary.amount * d.percentage) / 100;
                }
                return acc + amt;
            }, 0) + componentDeductionsSum;


            const grossPay = (salary.amount || 0) + earningsSum + rewardsSum + overtimeSum;


            const netPay = grossPay - deductionsSum - punishmentsSum;

            const payrollItem = new PayrollItem({
                payrollID: payroll._id,
                employeeID: employee._id,
                baseSalary: salary.amount || 0,
                rewards: rewards.map(r => r._id),
                overtimes: overtimes.map(o => o._id),
                punishments: punishments.map(p => ({ punishmentID: p._id })),
                deductions: deductions.map(d => ({ deductionID: d._id })),
                totalRewards: rewardsSum,
                totalOvertimes: overtimeSum,
                totalDeductions: deductionsSum,
                totalPunishments: punishmentsSum,
                grossPay,
                netPay,
                status: 'pending',
                componentBreakdown,
                createdBy: req.user._id,
                updatedBy: req.user._id
            })

            await payrollItem.save();
            itemsCreated++;
        }

        payroll.status = 'processing';
        payroll.processedBy = req.user._id;
        payroll.updatedBy = req.user._id;
        await payroll.save();

        return res.status(201).json({
            success: true,
            message: `Payroll items generated successfully for ${itemsCreated} employees`
        });

    } catch (error) {
        console.error(error);
        return next(new InternalServerError("Could not generate payroll items, please try again"));
    }
};


export const approvePayroll = async (req, res, next) => {
    let session;
    try {
        const { id } = req.params;

        if (!id) return next(new BadRequestError("Payroll ID is required"));
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid payroll ID"));

        const payroll = await Payroll.findById(id);
        if (!payroll) return next(new NotFoundError("Payroll not found"));

        if (!['draft', 'processing'].includes(payroll.status)) {
            return next(new BadRequestError("Only draft or processing payrolls can be approved"));
        }

        const items = await PayrollItem.find({ payrollID: id });
        if (!items.length) return next(new BadRequestError("Payroll has no items. Generate items first."));

        const totals = items.reduce(
            (acc, item) => {
                acc.gross += Number(item.grossPay) || 0
                acc.net += Number(item.netPay) || 0
                acc.deductions += Number(item.totalDeductions) || 0
                acc.rewards += Number(item.totalRewards) || 0
                acc.overtimes += Number(item.totalOvertimes) || 0
                acc.punishments += Number(item.totalPunishments) || 0
                return acc
            },
            { gross: 0, net: 0, deductions: 0, rewards: 0, overtimes: 0, punishments: 0 }
        )

        session = await mongoose.startSession();
        session.startTransaction();


        await PayrollItem.updateMany(
            { payrollID: id },
            {
                $set: {
                    status: 'approved',
                    updatedBy: req.user._id
                }
            },
            { session }
        );

        payroll.totalGrossPay = totals.gross;
        payroll.totalNetPay = totals.net;
        payroll.totalDeductions = totals.deductions;
        payroll.totalRewards = totals.rewards;
        payroll.totalOvertimes = totals.overtimes;
        payroll.totalPunishments = totals.punishments;
        payroll.totalEmployees = items.length;
        payroll.status = 'approved';
        payroll.approvedAt = new Date();
        payroll.approvedBy = req.user._id;
        payroll.updatedBy = req.user._id;

        await logAudit({
            req,
            action: 'APPROVE_PAYROLL',
            entity: 'Payroll',
            entityID: payroll._id,
            newValue: payroll
        })

        await payroll.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Payroll approved successfully",
            totals: {
                employees: items.length,
                grossPay: totals.gross,
                netPay: totals.net,
                deductions: totals.deductions
            }
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        return next(new InternalServerError("Could not approve payroll, please try again"));
    }
};


export const markPayrollAsPaid = async (req, res, next) => {
    let session;
    try {
        const { id } = req.params

        if (!id) return next(new BadRequestError("Payroll ID is required"))
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid payroll ID"))

        const payroll = await Payroll.findById(id)
        if (!payroll) return next(new NotFoundError("Payroll not found"))

        if (payroll.status !== 'approved') {
            return next(new BadRequestError("Only approved payrolls can be marked as paid"))
        }

        session = await mongoose.startSession();
        session.startTransaction();

        const result = await PayrollItem.updateMany(
            { payrollID: payroll._id },
            {
                $set: {
                    status: 'paid',
                    updatedBy: req.user._id,
                    paymentDate: new Date(),
                    paidBy: req.user._id,
                }
            },
            { session }
        );

        if (result.matchedCount === 0) {
            throw new NotFoundError("No payroll items found")
        }

        payroll.status = 'paid';
        payroll.paymentDate = new Date();
        payroll.paidBy = req.user._id;
        payroll.updatedBy = req.user._id;

        await logAudit({
            req,
            action: 'MARKASPAID_PAYROLL',
            entity: 'Payroll',
            entityID: payroll._id,
            newValue: payroll
        })

        await payroll.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: `Payroll marked as paid successfully. ${result.modifiedCount} items updated.`
        })
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        return next(new InternalServerError("Could not mark payroll as paid, please try again"))
    }
}


export const rejectPayroll = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cancelReason } = req.body;

        if (!id) return next(new BadRequestError("Payroll ID is required"))
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid payroll ID"))

        const payroll = await Payroll.findById(id)
        if (!payroll) return next(new NotFoundError("Payroll not found"))

        if (!['draft', 'processing'].includes(payroll.status)) {
            return next(new BadRequestError("Only draft or processing payrolls can be rejected"))
        }

        const result = await PayrollItem.deleteMany({ payrollID: payroll._id })

        payroll.status = 'rejected';
        payroll.cancelledAt = new Date();
        payroll.cancelledBy = req.user._id;
        payroll.cancelReason = cancelReason || "No reason provided";
        payroll.updatedBy = req.user._id;
        await payroll.save()

        return res.status(200).json({
            success: true,
            message: `Payroll rejected. ${result.deletedCount} payroll items deleted.`
        })
    } catch (error) {

        return next(new InternalServerError("Could not reject payroll, please try again"))
    }
}


export const getPayrollSummary = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) return next(new BadRequestError("Payroll ID is required"))
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid payroll ID"))

        const payroll = await Payroll.findById(id)
            .populate('createdBy', 'username')
            .populate('approvedBy', 'username')
            .populate('paidBy', 'username')
            .populate('cancelledBy', 'username')

        if (!payroll) return next(new NotFoundError("Payroll not found"))

        const items = await PayrollItem.find({ payrollID: payroll._id })
            .populate('employeeID', 'personalInfo.firstName personalInfo.lastName employeeCode')
            .select('employeeID baseSalary grossPay netPay totalDeductions totalRewards totalOvertimes totalPunishments status')

        const summary = await PayrollItem.aggregate([
            {
                $match: {
                    payrollID: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $group: {
                    _id: null,
                    totalEmployees: { $sum: 1 },
                    totalGrossPay: { $sum: "$grossPay" },
                    totalDeductions: { $sum: '$totalDeductions' },
                    totalNetPay: { $sum: "$netPay" },
                    totalRewards: { $sum: "$totalRewards" },
                    totalOvertimes: { $sum: "$totalOvertimes" },
                    totalPunishments: { $sum: "$totalPunishments" },
                }
            }
        ])

        const result = summary[0] || {
            totalEmployees: 0,
            totalGrossPay: 0,
            totalDeductions: 0,
            totalNetPay: 0,
            totalRewards: 0,
            totalOvertimes: 0,
            totalPunishments: 0,
        }


        return res.status(200).json({
            success: true,
            message: "Payroll summary fetched successfully",
            payroll: {
                _id: payroll._id,
                payrollCode: payroll.payrollCode,
                status: payroll.status,
                payPeriod: payroll.payPeriod,
                totalEmployees: result.totalEmployees,
                totalGrossPay: result.totalGrossPay,
                totalDeductions: result.totalDeductions,
                totalNetPay: result.totalNetPay,
                totalRewards: result.totalRewards,
                totalOvertimes: result.totalOvertimes,
                totalPunishments: result.totalPunishments,
                approvedBy: payroll.approvedBy,
                approvedAt: payroll.approvedAt,
                paidBy: payroll.paidBy,
                paymentDate: payroll.paymentDate
            },
            items
        })
    } catch (error) {

        return next(new InternalServerError("Could not fetch payroll summary, please try again"))
    }
}

export const getAllPayrolls = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query

        const query = {}

        if (status) query.status = status

        if (search) {
            query.payrollCode = { $regex: search, $options: 'i' }
        }

        const payrolls = await Payroll.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select(
                'payrollCode status payPeriod totalEmployees totalNetPay createdAt'
            )

        const total = await Payroll.countDocuments(query)

        const transformedPayroll = payrolls.map((p) => {
            return {
                _id: p._id,
                code: p.payrollCode,
                startDate: p.payPeriod.startDate,
                endDate: p.payPeriod.endDate,
                payDate: p.payPeriod.payDate,
                status: p.status
            }
        })

        return res.status(200).json({
            success: true,
            payrolls: transformedPayroll,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {

        return next(
            new InternalServerError('Could not fetch payrolls, please try again')
        )
    }
}

export const deletePayroll = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id))
            return next(new BadRequestError('Invalid payroll ID'))

        const payroll = await Payroll.findById(id)
        if (!payroll) return next(new NotFoundError('Payroll not found'))

        if (payroll.status !== 'draft') {
            return next(
                new BadRequestError('Only draft payrolls can be deleted')
            )
        }

        await PayrollItem.deleteMany({ payrollID: payroll._id })
        await payroll.deleteOne()

        return res.status(200).json({
            success: true,
            message: 'Payroll deleted successfully',
        })
    } catch (error) {

        return next(
            new InternalServerError('Could not delete payroll, please try again')
        )
    }
}


export const exportPayrollCSV = async (req, res, next) => {
    try {
        const { payrollID, status, month, year } = req.query;
        let query = {};

        if (payrollID && mongoose.Types.ObjectId.isValid(payrollID)) {
            query.payrollID = payrollID;
        }
        if (status) query.status = status;

        if (month && year) {
            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 1);

            const payrolls = await Payroll.find({ month: { $gte: start, $lt: end } }).select('_id');
            query.payrollID = { $in: payrolls.map(p => p._id) };
        }

        const items = await PayrollItem.find(query)
            .populate('employeeID', 'personalInfo.firstName personalInfo.lastName employeeCode')
            .populate('payrollID', 'name month status')
            .sort({ createdAt: -1 })
            .limit(10000);

        const header = ['Payroll Run', 'Month', 'Employee Code', 'Employee Name', 'Basic Salary', 'Total Earnings', 'Total Deductions', 'Net Pay', 'Status'];
        const rows = items.map(item => {
            const emp = item.employeeID;
            const payroll = item.payrollID;
            const name = emp ? `${emp.personalInfo?.firstName || ''} ${emp.personalInfo?.lastName || ''}`.trim() : '';
            const code = emp?.employeeCode || '';
            const runName = payroll?.payrollCode || '';
            const monthStr = payroll?.payPeriod?.startDate ? new Date(payroll.payPeriod.startDate).toISOString().slice(0, 7) : '';
            return [runName, monthStr, code, name, item.baseSalary ?? '', (item.grossPay - item.baseSalary) ?? 0, item.totalDeductions ?? '', item.netPay ?? '', item.status || ''].join(',');
        });

        const csv = [header.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="payroll-${Date.now()}.csv"`);
        return res.send(csv);
    } catch (error) {
        return next(new InternalServerError('Could not export payroll'));
    }
}


export const getLiabilityReport = async (req, res, next) => {
    try {
        const { year } = req.query;
        let matchCondition = { status: { $in: ['approved', 'paid'] } };

        let yearNum = year ? parseInt(year) : new Date().getFullYear();

        const report = await PayrollItem.aggregate([
            { $match: matchCondition },
            {
                $lookup: {
                    from: 'payrolls',
                    localField: 'payrollID',
                    foreignField: '_id',
                    as: 'payrollData'
                }
            },
            { $unwind: '$payrollData' },
            {
                $match: {
                    'payrollData.payPeriod.startDate': {
                        $gte: new Date(`${yearNum}-01-01`),
                        $lt: new Date(`${yearNum + 1}-01-01`)
                    }
                }
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeID',
                    foreignField: '_id',
                    as: 'employeeData'
                }
            },
            { $unwind: '$employeeData' },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'employeeData.employmentInfo.departmentID',
                    foreignField: '_id',
                    as: 'departmentData'
                }
            },
            { $unwind: { path: '$departmentData', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: {
                        month: { $month: '$payrollData.payPeriod.startDate' },
                        year: { $year: '$payrollData.payPeriod.startDate' },
                        departmentID: '$departmentData._id',
                        departmentName: { $ifNull: ['$departmentData.name', 'Unassigned'] }
                    },
                    totalGrossPay: { $sum: '$grossPay' },
                    totalNetPay: { $sum: '$netPay' },
                    totalDeductions: { $sum: '$totalDeductions' },
                    employeeCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.departmentName': 1 }
            }
        ]);

        const formattedReport = report.map(item => ({
            month: item._id.month,
            year: item._id.year,
            department: item._id.departmentName,
            totalGrossPay: item.totalGrossPay,
            totalNetPay: item.totalNetPay,
            totalDeductions: item.totalDeductions,
            employeeCount: item.employeeCount,
            employerTaxes: 0,
            totalLiability: item.totalGrossPay
        }));

        return res.status(200).json({
            success: true,
            report: formattedReport
        })
    } catch (error) {

        return next(new InternalServerError("Could not fetch liability report"));
    }
}