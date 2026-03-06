import mongoose from 'mongoose';
import Notification from '../models/Notification.Model.js';
import { InternalServerError, NotFoundError, BadRequestError } from '../utils/Error.Classes.js';

// ─── Internal helper: create a notification (called from other controllers) ──
export const createNotification = async ({ userID, type, title, message, priority = 'medium', actionUrl }) => {
    try {
        await Notification.create({ userID, type, title, message, priority, actionUrl });
    } catch (e) {
        console.error('[Notification] Failed to create notification:', e.message);
    }
};


export const getMyNotifications = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 20), 1);
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ userID: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ userID: req.user._id }),
            Notification.countDocuments({ userID: req.user._id, isRead: false }),
        ]);

        return res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            unreadCount,
            notifications,
        });
    } catch (error) {
        return next(new InternalServerError('Could not fetch notifications'));
    }
};


export const getUnreadCount = async (req, res, next) => {
    try {
        const unreadCount = await Notification.countDocuments({ userID: req.user._id, isRead: false });
        return res.status(200).json({ success: true, unreadCount });
    } catch (error) {
        return next(new InternalServerError('Could not fetch unread count'));
    }
};


export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError('Invalid ID'));

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userID: req.user._id },
            { $set: { isRead: true, readAt: new Date() } },
            { new: true }
        );
        if (!notification) return next(new NotFoundError('Notification not found'));

        return res.status(200).json({ success: true, notification });
    } catch (error) {
        return next(new InternalServerError('Could not mark notification as read'));
    }
};


export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userID: req.user._id, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );
        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        return next(new InternalServerError('Could not mark all notifications as read'));
    }
};


export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError('Invalid ID'));

        const notification = await Notification.findOneAndDelete({ _id: id, userID: req.user._id });
        if (!notification) return next(new NotFoundError('Notification not found'));

        return res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        return next(new InternalServerError('Could not delete notification'));
    }
};

// ─── Admin: Send notification to one user or broadcast to all ─────────────────
export const sendNotification = async (req, res, next) => {
    try {
        const allowedRoles = ['admin', 'hr_manager', 'super_admin'];
        if (!allowedRoles.includes(req.user.role)) {
            return next(new BadRequestError('Unauthorized'));
        }

        const { userIDs, title, message, type = 'info', priority = 'medium', actionUrl, broadcast } = req.body;

        if (!title || !message) {
            return next(new BadRequestError('Title and message are required'));
        }

        let targetUserIDs = [];

        if (broadcast) {
            
            const User = mongoose.model('User');
            const users = await User.find({}).select('_id');
            targetUserIDs = users.map(u => u._id);
        } else {
            if (!userIDs || !Array.isArray(userIDs) || userIDs.length === 0) {
                return next(new BadRequestError('Provide at least one userID or set broadcast: true'));
            }
            targetUserIDs = userIDs.filter(id => mongoose.Types.ObjectId.isValid(id));
        }

        if (targetUserIDs.length === 0) {
            return next(new BadRequestError('No valid recipient user IDs found'));
        }

        const docs = targetUserIDs.map(userID => ({
            userID,
            type,
            title,
            message,
            priority,
            actionUrl: actionUrl || undefined,
            isRead: false,
        }));

        await Notification.insertMany(docs);

        return res.status(201).json({
            success: true,
            message: `Notification sent to ${targetUserIDs.length} user(s)`,
            recipientCount: targetUserIDs.length,
        });
    } catch (error) {
        console.error('[Notification] sendNotification error:', error);
        return next(new InternalServerError('Could not send notification'));
    }
};

// ─── Admin: List all notifications (all users) ───────────────────────────────
export const getAllNotificationsAdmin = async (req, res, next) => {
    try {
        const allowedRoles = ['admin', 'hr_manager', 'super_admin'];
        if (!allowedRoles.includes(req.user.role)) {
            return next(new BadRequestError('Unauthorized'));
        }

        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 30), 1);
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({})
                .populate('userID', 'username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({}),
        ]);

        return res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            notifications,
        });
    } catch (error) {
        return next(new InternalServerError('Could not fetch notifications'));
    }
};

