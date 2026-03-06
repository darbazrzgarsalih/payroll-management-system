import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import PayrollItem from '../models/PayrollItem.Model.js';
import PaySlip from '../models/Payslip.Model.js';
import PayslipJob from '../models/PayslipJob.Model.js';
import Payroll from '../models/Payroll.Model.js';
import Employee from '../models/Employee.Model.js';
import { BadRequestError, NotFoundError, InternalServerError } from '../utils/Error.Classes.js';
import { logAudit } from '../utils/Audit.Logger.js';
import { generatePayslipPDF } from '../services/PDF.Service.js';
import { sendPayslipApprovalEmail } from '../services/Email.Service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAYSLIPS_DIR = path.join(__dirname, '..', '..', '..', 'payslips');

const populatePayslip = (q) =>
    q.populate('employeeID', 'firstName lastName enr personalInfo')
        .populate('payrollID', 'name payrollCode payPeriod')
        .populate('payrollItemID')
        .populate('createdBy', 'username')
        .populate('approvedBy', 'username')
        .populate('paidBy', 'username');



async function computeYTD(employeeID) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const [result] = await PaySlip.aggregate([
        {
            $match: {
                employeeID: new mongoose.Types.ObjectId(employeeID),
                status: { $in: ['approved', 'paid'] },
                createdAt: { $gte: yearStart },
            },
        },
        {
            $group: {
                _id: null,
                ytdGross: { $sum: '$grossPay' },
                ytdDeductions: { $sum: { $subtract: ['$grossPay', '$netPay'] } },
            },
        },
    ]);
    return {
        ytdEarnings: result?.ytdGross ?? 0,
        ytdDeductions: result?.ytdDeductions ?? 0,
    };
}

async function withYTD(payslip) {
    const empId = payslip.employeeID?._id ?? payslip.employeeID;
    if (!empId) return payslip;
    const ytd = await computeYTD(empId);
    payslip.ytdEarnings = ytd.ytdEarnings;
    payslip.ytdDeductions = ytd.ytdDeductions;
    return payslip;
}


async function createDbJob(jobId, payrollID, userId) {
    try {
        await PayslipJob.create({
            jobId,
            payrollID,
            createdBy: userId,
            status: 'pending',
            progress: 0,
            total: 0,
            message: 'Starting...',
        });
    } catch (e) {
        console.error('[JobStore] createDbJob failed:', e.message);
    }
}

async function updateDbJob(jobId, updates) {
    try {
        await PayslipJob.findOneAndUpdate({ jobId }, { $set: updates });
    } catch (e) {
        console.error('[JobStore] updateDbJob failed:', e.message);
    }
}





export const getEligiblePayrolls = async (req, res, next) => {
    try {
        
        const payrolls = await Payroll.find({ status: { $in: ['paid', 'approved'] } })
            .sort({ createdAt: -1 })
            .select('payrollCode payPeriod status createdAt');

        
        const payrollIdsWithPayslips = await PaySlip.distinct('payrollID');
        const eligiblePayrolls = payrolls.filter(
            (p) => !payrollIdsWithPayslips.some((id) => id && id.equals(p._id))
        );

        return res.status(200).json({
            success: true,
            payrolls: eligiblePayrolls.map((p) => ({
                _id: p._id,
                code: p.payrollCode,
                startDate: p.payPeriod?.startDate,
                endDate: p.payPeriod?.endDate,
                status: p.status,
            })),
        });
    } catch (error) {
        console.error('[getEligiblePayrolls]', error);
        return next(new InternalServerError('Could not fetch eligible payrolls'));
    }
};


export const generatePaySlipsForPayroll = async (req, res, next) => {
    try {
        const { payrollID } = req.params;
        if (!payrollID) return next(new BadRequestError('Payroll ID is required'));
        if (!mongoose.Types.ObjectId.isValid(payrollID))
            return next(new BadRequestError('Invalid Payroll ID'));

        
        const payroll = await Payroll.findById(payrollID);
        if (!payroll) return next(new NotFoundError('Payroll not found'));
        if (!['paid', 'approved'].includes(payroll.status))
            return next(new BadRequestError('Payslips can only be generated for approved or paid payrolls'));

        const existing = await PaySlip.findOne({ payrollID });
        if (existing)
            return next(new BadRequestError('Payslips already generated for this payroll.'));

        const payrollItems = await PayrollItem.find({ payrollID, status: 'paid' })
            .populate('payrollID', 'name payrollCode payPeriod')
            .populate('employeeID', 'firstName lastName enr');

        if (payrollItems.length === 0)
            return next(new NotFoundError('No paid payroll items found for this payroll'));

        const jobId = uuidv4();
        await createDbJob(jobId, payrollID, req.user._id);

        
        res.status(202).json({
            success: true,
            message: 'Payslip generation started.',
            jobId,
            total: payrollItems.length,
        });

        
        (async () => {
            await updateDbJob(jobId, { status: 'running', total: payrollItems.length });
            let count = 0;

            for (let i = 0; i < payrollItems.length; i++) {
                const item = payrollItems[i];
                try {
                    const payslip = await PaySlip.create({
                        payrollID: item.payrollID._id ?? item.payrollID,
                        payrollItemID: item._id,
                        employeeID: item.employeeID._id ?? item.employeeID,
                        payPeriod: item.payrollID?.payPeriod
                            ? { startDate: item.payrollID.payPeriod.startDate, endDate: item.payrollID.payPeriod.endDate }
                            : null,
                        baseSalary: item.baseSalary,
                        rewards: item.rewards ?? [],
                        overtimes: item.overtimes ?? [],
                        deductions: item.deductions ?? [],
                        punishments: item.punishments ?? [],
                        grossPay: item.grossPay,
                        netPay: item.netPay,
                        payDate: item.paymentDate,
                        status: 'draft',
                        createdBy: req.user._id,
                    });

                    
                    try {
                        const populated = await populatePayslip(PaySlip.findById(payslip._id));
                        const absPath = await generatePayslipPDF(populated);
                        
                        const relPath = path.relative(
                            path.join(__dirname, '..', '..', '..'),
                            absPath
                        );
                        await PaySlip.findByIdAndUpdate(payslip._id, {
                            fileUrl: relPath,
                            generatedAt: new Date(),
                        });
                    } catch (pdfErr) {
                        console.error('[PDF] Failed for payslip', payslip._id, pdfErr.message);
                    }

                    count++;
                    await updateDbJob(jobId, {
                        progress: count,
                        message: `Generated ${count} of ${payrollItems.length}`,
                    });
                } catch (itemErr) {
                    console.error('[generate] Error on item', item._id, itemErr.message);
                }
            }

            await updateDbJob(jobId, {
                status: 'done',
                progress: count,
                result: { count },
                message: `Successfully generated ${count} payslips`,
            });
        })().catch(async (err) => {
            console.error('[generatePaySlipsForPayroll background]', err);
            await updateDbJob(jobId, { status: 'failed', error: err.message });
        });
    } catch (error) {
        console.error('[generatePaySlipsForPayroll]', error);
        return next(new InternalServerError('Could not start payslip generation'));
    }
};


export const getJobStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const job = await PayslipJob.findOne({ jobId });
        if (!job) return next(new NotFoundError('Job not found'));
        return res.status(200).json({ success: true, job });
    } catch (error) {
        return next(new InternalServerError('Could not fetch job status'));
    }
};


export const downloadPayslipPDF = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return next(new BadRequestError('Invalid payslip ID'));

        const payslip = await PaySlip.findById(id);
        if (!payslip) return next(new NotFoundError('Payslip not found'));

        // Access control: employees can only download their own
        if (req.user.role === 'employee') {
            const empId = payslip.employeeID?.toString();
            const reqEmpId = req.user.employeeID?.toString();
            if (empId !== reqEmpId)
                return next(new NotFoundError('Payslip not found'));
        }

        
        let absPath = payslip.fileUrl
            ? path.resolve(path.join(__dirname, '..', '..', '..'), payslip.fileUrl)
            : null;

        if (!absPath || !fs.existsSync(absPath)) {
            
            try {
                const populated = await populatePayslip(PaySlip.findById(id));
                absPath = await generatePayslipPDF(populated);
                const relPath = path.relative(path.join(__dirname, '..', '..', '..'), absPath);
                await PaySlip.findByIdAndUpdate(id, { fileUrl: relPath, generatedAt: new Date() });
            } catch {
                return next(new InternalServerError('Could not generate PDF'));
            }
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="payslip_${id}.pdf"`);
        fs.createReadStream(absPath).pipe(res);
    } catch (error) {
        console.error('[downloadPayslipPDF]', error);
        return next(new InternalServerError('Could not download payslip'));
    }
};


export const getAllPayslips = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 15), 1);
        const skip = (page - 1) * limit;
        const { search, status, month, year } = req.query;

        let queryObject = {};
        if (status) queryObject.status = status;
        if (month || year) {
            const m = month ? Number(month) : null;
            const y = year ? Number(year) : new Date().getFullYear();
            let startDate, endDate;
            if (m) {
                startDate = new Date(y, m - 1, 1);
                endDate = new Date(y, m, 1);
            } else {
                startDate = new Date(y, 0, 1);
                endDate = new Date(y + 1, 0, 1);
            }
            
            queryObject.$or = [
                { payDate: { $gte: startDate, $lt: endDate } },
                { payDate: null, 'payPeriod.startDate': { $gte: startDate, $lt: endDate } },
            ];
        }

        let payslips, total;

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            const pipeline = [
                { $match: queryObject },
                { $lookup: { from: 'employees', localField: 'employeeID', foreignField: '_id', as: 'employeeID' } },
                { $unwind: { path: '$employeeID', preserveNullAndEmpty: true } },
                { $lookup: { from: 'payrolls', localField: 'payrollID', foreignField: '_id', as: 'payrollID' } },
                { $unwind: { path: '$payrollID', preserveNullAndEmpty: true } },
                {
                    $match: {
                        $or: [
                            { 'employeeID.firstName': regex },
                            { 'employeeID.lastName': regex },
                            { 'employeeID.personalInfo.firstName': regex },
                            { 'employeeID.personalInfo.lastName': regex },
                            { 'payrollID.payrollCode': regex },
                            { 'payrollID.name': regex },
                        ],
                    },
                },
                {
                    $facet: {
                        data: [{ $sort: { payDate: -1 } }, { $skip: skip }, { $limit: limit }],
                        count: [{ $count: 'total' }],
                    },
                },
            ];
            const [result] = await PaySlip.aggregate(pipeline);
            payslips = result.data;
            total = result.count[0]?.total ?? 0;
        } else {
            [payslips, total] = await Promise.all([
                populatePayslip(PaySlip.find(queryObject).skip(skip).limit(limit).sort({ payDate: -1 })),
                PaySlip.countDocuments(queryObject),
            ]);
        }

        return res.status(200).json({
            success: true,
            message: 'Payslips fetched',
            total,
            totalPages: Math.ceil(total / limit),
            payslips,
        });
    } catch (error) {
        console.error('[getAllPayslips]', error);
        return next(new InternalServerError('Could not fetch payslips'));
    }
};



export const getMyPayslips = async (req, res, next) => {
    try {
        const employeeID = req.user.employeeID;
        if (!employeeID) return next(new BadRequestError('Employee account required'));

        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 20), 1);
        const skip = (page - 1) * limit;
        const { status, month, year } = req.query;

        const queryObject = { employeeID };
        if (status) queryObject.status = status;
        if (month && year) {
            const m = Number(month), y = Number(year);
            queryObject.payDate = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
        } else if (year) {
            const y = Number(year);
            queryObject.payDate = { $gte: new Date(y, 0, 1), $lt: new Date(y + 1, 0, 1) };
        }

        const [payslips, total] = await Promise.all([
            populatePayslip(PaySlip.find(queryObject).skip(skip).limit(limit).sort({ payDate: -1 })),
            PaySlip.countDocuments(queryObject),
        ]);

        return res.status(200).json({
            success: true,
            message: 'Payslips found',
            total,
            totalPages: Math.ceil(total / limit),
            payslips,
        });
    } catch (error) {
        console.error('[getMyPayslips]', error);
        return next(new InternalServerError('Could not fetch payslips'));
    }
};


export const getPayslipById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return next(new BadRequestError('Invalid payslip ID'));

        let payslip = await populatePayslip(PaySlip.findById(id));
        if (!payslip) return next(new NotFoundError('Payslip not found'));

        if (req.user.role === 'employee') {
            const empId = (payslip.employeeID?._id ?? payslip.employeeID)?.toString();
            if (empId !== req.user.employeeID?.toString())
                return next(new NotFoundError('Payslip not found'));
        }

        
        payslip = payslip.toObject();
        const ytd = await computeYTD(payslip.employeeID?._id ?? payslip.employeeID);
        payslip.ytdEarnings = ytd.ytdEarnings;
        payslip.ytdDeductions = ytd.ytdDeductions;

        return res.status(200).json({ success: true, payslip });
    } catch (error) {
        console.error('[getPayslipById]', error);
        return next(new InternalServerError('Could not fetch payslip'));
    }
};


export const updatePayslipStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return next(new BadRequestError('Invalid payslip ID'));

        const VALID = ['draft', 'approved', 'paid'];
        if (!status || !VALID.includes(status))
            return next(new BadRequestError(`Status must be one of: ${VALID.join(', ')}`));

        const payslip = await populatePayslip(PaySlip.findById(id));
        if (!payslip) return next(new NotFoundError('Payslip not found'));

        // Transition logic: 
        
        
        if (payslip.status === 'paid') {
            return next(new BadRequestError('Payslip is already paid and cannot be modified.'));
        }
        if (payslip.status === 'approved' && status !== 'paid') {
            return next(new BadRequestError('Approved payslips can only be moved to "Paid" status.'));
        }

        const oldStatus = payslip.status;
        payslip.status = status;
        payslip.updatedBy = req.user._id;
        if (status === 'approved') { payslip.approvedBy = req.user._id; payslip.approvedAt = new Date(); }
        if (status === 'paid') { payslip.paidBy = req.user._id; payslip.paidAt = new Date(); }

        await logAudit({
            req,
            action: 'UPDATE_PAYSLIP_STATUS',
            entity: 'PaySlip',
            entityID: payslip._id,
            oldValue: { status: oldStatus },
            newValue: { status },
        });

        await payslip.save();

        
        if (status === 'approved') {
            try {
                const emp = await Employee.findById(payslip.employeeID).select('personalInfo');
                const email = emp?.personalInfo?.email;
                const empName = emp
                    ? `${emp.personalInfo?.firstName ?? ''} ${emp.personalInfo?.lastName ?? ''}`.trim()
                    : 'Employee';

                if (email) {
                    let pdfAbsPath = null;
                    if (payslip.fileUrl) {
                        pdfAbsPath = path.resolve(path.join(__dirname, '..', '..', '..'), payslip.fileUrl);
                        if (!fs.existsSync(pdfAbsPath)) pdfAbsPath = null;
                    }
                    await sendPayslipApprovalEmail({
                        to: email,
                        employeeName: empName,
                        payslip: payslip.toObject ? payslip.toObject() : payslip,
                        pdfPath: pdfAbsPath,
                    });
                }
            } catch (emailErr) {
                console.error('[Email] Failed to send approval email:', emailErr.message);
            }
        }

        const fresh = await populatePayslip(PaySlip.findById(id));
        const freshObj = fresh.toObject();
        const ytd = await computeYTD(freshObj.employeeID?._id ?? freshObj.employeeID);
        freshObj.ytdEarnings = ytd.ytdEarnings;
        freshObj.ytdDeductions = ytd.ytdDeductions;

        return res.status(200).json({ success: true, message: `Payslip marked as ${status}`, payslip: freshObj });
    } catch (error) {
        console.error('[updatePayslipStatus]', error);
        return next(new InternalServerError('Could not update payslip status'));
    }
};



export const bulkUpdateStatus = async (req, res, next) => {
    try {
        const { ids, status } = req.body;

        if (!Array.isArray(ids) || ids.length === 0)
            return next(new BadRequestError('ids must be a non-empty array'));

        const VALID = ['approved', 'paid'];
        if (!status || !VALID.includes(status))
            return next(new BadRequestError(`Status must be one of: ${VALID.join(', ')}`));

        for (const id of ids) {
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new BadRequestError(`Invalid payslip ID: ${id}`));
        }

        
        const payslips = await PaySlip.find({ _id: { $in: ids } }).select('_id status');

        
        // Eligible if:
        
        
        const eligible = payslips.filter((p) => {
            if (p.status === 'draft') return true;
            if (p.status === 'approved' && status === 'paid') return true;
            return false;
        });
        const locked = payslips.filter((p) => !eligible.some(e => e._id.equals(p._id)));

        if (eligible.length === 0) {
            return next(new BadRequestError(
                `All ${locked.length} selected payslip(s) are already locked (approved/paid).`
            ));
        }

        const eligibleIds = eligible.map((p) => p._id);
        const updateData = { status, updatedBy: req.user._id };
        if (status === 'approved') { updateData.approvedBy = req.user._id; updateData.approvedAt = new Date(); }
        if (status === 'paid') { updateData.paidBy = req.user._id; updateData.paidAt = new Date(); }

        const result = await PaySlip.updateMany({ _id: { $in: eligibleIds } }, { $set: updateData });

        await logAudit({
            req,
            action: 'BULK_UPDATE_PAYSLIP_STATUS',
            entity: 'PaySlip',
            entityID: null,
            oldValue: null,
            newValue: { ids: eligibleIds.map(String), status },
        });

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} payslip(s) updated to ${status}. ${locked.length} skipped (already locked).`,
            updated: result.modifiedCount,
            skipped: locked.length,
            skippedIds: locked.map((p) => p._id),
        });
    } catch (error) {
        console.error('[bulkUpdateStatus]', error);
        return next(new InternalServerError('Could not bulk update payslips'));
    }
};

export const createAdjustmentPayslip = async (req, res, next) => {
    try {
        const { originalPayslipID, adjustmentReason, grossPay, netPay, deductions, rewards, punishments, overtimes } = req.body;

        if (!originalPayslipID || !mongoose.Types.ObjectId.isValid(originalPayslipID))
            return next(new BadRequestError('Valid originalPayslipID is required'));
        if (!adjustmentReason?.trim())
            return next(new BadRequestError('adjustmentReason is required'));

        const original = await populatePayslip(PaySlip.findById(originalPayslipID));
        if (!original) return next(new NotFoundError('Original payslip not found'));

        if (!['approved', 'paid'].includes(original.status)) {
            return next(new BadRequestError('Can only create adjustments for approved or paid payslips'));
        }

        const adjustment = await PaySlip.create({
            payrollID: original.payrollID?._id ?? original.payrollID,
            payrollItemID: original.payrollItemID?._id ?? original.payrollItemID,
            employeeID: original.employeeID?._id ?? original.employeeID,
            payPeriod: original.payPeriod,
            baseSalary: original.baseSalary,
            
            grossPay: grossPay ?? original.grossPay,
            netPay: netPay ?? original.netPay,
            deductions: deductions ?? original.deductions,
            rewards: rewards ?? original.rewards,
            overtimes: overtimes ?? original.overtimes,
            punishments: punishments ?? original.punishments,
            status: 'draft',
            isAdjustment: true,
            adjustedPayslipID: original._id,
            adjustmentReason: adjustmentReason.trim(),
            payDate: original.payDate,
            createdBy: req.user._id,
        });

        await logAudit({
            req,
            action: 'CREATE_ADJUSTMENT_PAYSLIP',
            entity: 'PaySlip',
            entityID: adjustment._id,
            oldValue: { originalPayslipID, originalStatus: original.status },
            newValue: { adjustmentReason },
        });

        const populated = await populatePayslip(PaySlip.findById(adjustment._id));
        return res.status(201).json({
            success: true,
            message: 'Adjustment payslip created',
            payslip: populated,
        });
    } catch (error) {
        console.error('[createAdjustmentPayslip]', error);
        return next(new InternalServerError('Could not create adjustment payslip'));
    }
};