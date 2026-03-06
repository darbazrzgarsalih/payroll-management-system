import express from 'express';
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import {
    createHoliday,
    getAllHolidays,
    getHolidayById,
    updateHoliday,
    deleteHoliday,
} from '../controllers/Holiday.Controller.js';

const router = express.Router();

router.get('/', authMiddleware, authorize(PERMISSIONS.HOLIDAY_VIEW), getAllHolidays);
router.get('/:id', authMiddleware, authorize(PERMISSIONS.HOLIDAY_VIEW), getHolidayById);
router.post('/', authMiddleware, authorize(PERMISSIONS.HOLIDAY_CREATE), createHoliday);
router.put('/:id', authMiddleware, authorize(PERMISSIONS.HOLIDAY_UPDATE), updateHoliday);
router.delete('/:id', authMiddleware, authorize(PERMISSIONS.HOLIDAY_DELETE), deleteHoliday);

export default router;
