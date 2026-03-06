import mongoose from 'mongoose';
import Reward from '../models/Reward.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';

export const createReward = async (req, res, next) => {
    try {
        const { employeeID, amount, reason, payrollID } = req.body;
        if (!employeeID || !amount || !payrollID) return next(new BadRequestError("Employee, amount and payrollID required"))

        const reward = new Reward({
            employeeID,
            amount,
            reason,
            payrollID,
            createdBy: req.user._id,
        })

        await reward.save()

        res.status(201).json({
            success: true,
            message: "Reward created",
            reward
        });

    } catch (error) {
        next(new InternalServerError("Could not create reward"));
    }
}

export const createBulkRewards = async (req, res, next) => {
    let session;
    try {
        const { employeeIDs, amount, reason, payrollID } = req.body;

        if (!employeeIDs || !Array.isArray(employeeIDs) || employeeIDs.length === 0) {
            return next(new BadRequestError("employeeIDs must be a non-empty array"));
        }
        if (!amount || !payrollID) {
            return next(new BadRequestError("Amount and payrollID are required"));
        }

        for (const id of employeeIDs) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new BadRequestError(`Invalid employee ID: ${id}`));
            }
        }
        session = await mongoose.startSession()
        session.startTransaction()

        const rewards = employeeIDs.map(empID => ({
            employeeID: empID,
            amount,
            reason,
            payrollID,
            createdBy: req.user._id
        }));
        const createdRewards = await Reward.insertMany(rewards, { session });
        session.commitTransaction()
        return res.status(201).json({
            success: true,
            message: `Created ${createdRewards.length} rewards successfully`,
            rewards: createdRewards
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        console.error(error);
        return next(new InternalServerError("Could not create bulk rewards"));
    }
};

export const getAllRewards = async (req, res, next) => {
    try {
        const { payrollID, employeeID, search, status } = req.query;
        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 100)
        const skip = (page - 1) * limit

        let queryObject = {}

        if (employeeID) {
            if (!mongoose.Types.ObjectId.isValid(employeeID)) {
                return next(new BadRequestError("Invalid employee ID"))
            }
            queryObject.employeeID = employeeID
        }

        if (payrollID) {
            if (!mongoose.Types.ObjectId.isValid(payrollID)) {
                return next(new BadRequestError("Invalid payroll ID"))
            }
            queryObject.payrollID = payrollID
        }

        if (status) {
            queryObject.status = status;
        }

        if (search) {
            const matchingEmployees = await mongoose.model('Employee').find({
                $or: [
                    { "personalInfo.firstName": { $regex: search, $options: "i" } },
                    { "personalInfo.lastName": { $regex: search, $options: "i" } },
                    { employeeCode: { $regex: search, $options: "i" } }
                ]
            }).select('_id');

            const employeeIDs = matchingEmployees.map(emp => emp._id);

            queryObject.$or = [
                { reason: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } },
                { employeeID: { $in: employeeIDs } }
            ];
        }

        const rewards = await Reward.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('employeeID', 'personalInfo.firstName personalInfo.middleName personalInfo.lastName')
            .populate('payrollID', 'payrollCode')
        const transformedReward = rewards.map((r) => {
            const firstName = r.employeeID?.personalInfo?.firstName || "";
            const middleName = r.employeeID?.personalInfo?.middleName || "";
            const lastName = r.employeeID?.personalInfo?.lastName || "";

            return {
                id: r._id.toString(),
                employeeName: [firstName, middleName, lastName].filter(Boolean).join(" ") || "Unknown Employee",
                payrollName: r.payrollID?.payrollCode || "N/A",
                type: r.type,
                amount: r.amount,
                reason: r.reason,
                paymentDate: r.paymentDate,
                status: r.status,
            }
        })

        const total = await Reward.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Rewards fetched",
            total,
            totalPages: Math.ceil(total / limit),
            rewards: transformedReward
        })

    } catch (error) {
        
        return next(new InternalServerError("Could not fetch rewards"));
    }
}

export const getSingleReward = async (req, res, next) => {
    try {
        const { employeeID, payrollID } = req.params;

        if (!employeeID || !payrollID) {
            return next(new BadRequestError("employeeID and payrollID are required"))
        }

        if (!mongoose.Types.ObjectId.isValid(employeeID) || !mongoose.Types.ObjectId.isValid(payrollID)) {
            return next(new BadRequestError("Invalid ID"))
        }
        const reward = await Reward.findOne({
            employeeID,
            payrollID
        })
        if (!reward) {
            return next(new NotFoundError("Reward not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Reward found",
            reward
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch reward"));
    }
}

export const updateReward = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return next(new BadRequestError("Reward ID is required"))
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError("Invalid ID"))

        
        const existing = await Reward.findById(id);
        if (!existing) return next(new NotFoundError("Reward not found"))
        if (existing.status === 'voided') return next(new BadRequestError("Voided rewards cannot be updated"))
        if (existing.status === 'paid') return next(new BadRequestError("Paid rewards cannot be updated"))

        const allowedUpdates = ['type', 'amount', 'reason']

        const buildUpdateObj = (updates, allowedFields) => {
            const updateObj = {};
            for (const field of allowedFields) {
                if (updates[field] !== undefined) updateObj[field] = updates[field];
            }
            return updateObj;
        };

        const updateData = buildUpdateObj(req.body, allowedUpdates)
        if (Object.keys(updateData).length === 0) return next(new BadRequestError("No update data provided"))

        updateData.updatedBy = req.user._id
        const reward = await Reward.findByIdAndUpdate(id, { $set: updateData }, { runValidators: true, new: true })

        return res.status(200).json({
            success: true,
            message: "Reward has been updated",
            reward
        })

    } catch (error) {
        return next(new InternalServerError("Could not update reward"))
    }
}

export const voidReward = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new BadRequestError("Reward ID is required"))
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid ID"))
        }

        const reward = await Reward.findOne({ _id: id })
        if (!reward) {
            return next(new NotFoundError("Reward not found"))
        }

        if (reward.status === 'paid') {
            return next(new BadRequestError("Cannot void a paid reward"))
        }
        reward.status = 'voided'
        reward.voidedAt = Date.now()
        reward.voidedBy = req.user._id
        await reward.save()

        return res.status(200).json({
            success: true,
            message: "Reward has been voided",
        })
    } catch (error) {
        return next(new InternalServerError("Could not delete reward"))
    }
}