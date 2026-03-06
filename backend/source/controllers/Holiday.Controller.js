import mongoose from 'mongoose';
import Holiday from '../models/Holiday.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';
import { logAudit } from '../utils/Audit.Logger.js';

export const createHoliday = async (req, res, next) => {
    try {
        const { name, date, type, isRecurring, isPaid, description } = req.body;
        if (!name || !date) return next(new BadRequestError('Name and date are required'));

        const holiday = await Holiday.create({
            name: name.trim(),
            date: new Date(date),
            type: type || 'public',
            isRecurring: isRecurring ?? false,
            isPaid: isPaid ?? true,
            description,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        await logAudit({ req, action: 'CREATE_HOLIDAY', entity: 'Holiday', entityID: holiday._id, newValue: holiday });

        return res.status(201).json({ success: true, message: 'Holiday created', holiday });
    } catch (error) {
        return next(new InternalServerError('Could not create holiday'));
    }
};

export const getAllHolidays = async (req, res, next) => {
    try {
        const { month, year, type } = req.query;
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 50), 1);
        const skip = (page - 1) * limit;

        let query = {};
        if (type) query.type = type;

        if (month || year) {
            const y = year ? Number(year) : new Date().getFullYear();
            const m = month ? Number(month) : null;
            let start, end;
            if (m) {
                start = new Date(y, m - 1, 1);
                end = new Date(y, m, 1);
            } else {
                start = new Date(y, 0, 1);
                end = new Date(y + 1, 0, 1);
            }
            query.date = { $gte: start, $lt: end };
        }

        const [holidays, total] = await Promise.all([
            Holiday.find(query)
                .sort({ date: 1 })
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'username'),
            Holiday.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            holidays,
        });
    } catch (error) {
        return next(new InternalServerError('Could not fetch holidays'));
    }
};

export const getHolidayById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError('Invalid ID'));
        const holiday = await Holiday.findById(id);
        if (!holiday) return next(new NotFoundError('Holiday not found'));
        return res.status(200).json({ success: true, holiday });
    } catch (error) {
        return next(new InternalServerError('Could not fetch holiday'));
    }
};

export const updateHoliday = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError('Invalid ID'));

        const allowed = ['name', 'date', 'type', 'isRecurring', 'isPaid', 'description'];
        const updates = {};
        for (const f of allowed) {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        }
        updates.updatedBy = req.user._id;

        const holiday = await Holiday.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
        if (!holiday) return next(new NotFoundError('Holiday not found'));

        await logAudit({ req, action: 'UPDATE_HOLIDAY', entity: 'Holiday', entityID: holiday._id, newValue: holiday });

        return res.status(200).json({ success: true, message: 'Holiday updated', holiday });
    } catch (error) {
        return next(new InternalServerError('Could not update holiday'));
    }
};

export const deleteHoliday = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError('Invalid ID'));

        const holiday = await Holiday.findByIdAndDelete(id);
        if (!holiday) return next(new NotFoundError('Holiday not found'));

        await logAudit({ req, action: 'DELETE_HOLIDAY', entity: 'Holiday', entityID: id, oldValue: holiday });

        return res.status(200).json({ success: true, message: 'Holiday deleted' });
    } catch (error) {
        return next(new InternalServerError('Could not delete holiday'));
    }
};
