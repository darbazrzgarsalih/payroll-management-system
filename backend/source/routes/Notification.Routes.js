import express from 'express';
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    getAllNotificationsAdmin,
} from '../controllers/Notification.Controller.js';

const router = express.Router();

router.get('/', authMiddleware, getMyNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.get('/admin/all', authMiddleware, getAllNotificationsAdmin);
router.post('/send', authMiddleware, sendNotification);
router.patch('/:id/read', authMiddleware, markAsRead);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;

