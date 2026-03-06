import express from 'express';
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import { createPosition, deletePosition, getAllPositions, getPositionById, getSinglePosition, updatePosition } from '../controllers/Position.Controller.js';

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.POSITION_VIEW), getAllPositions)
router.get('/code/:code', authMiddleware, authorize(PERMISSIONS.POSITION_VIEW), getSinglePosition)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.POSITION_VIEW), getPositionById)
router.post('/', authMiddleware, authorize(PERMISSIONS.POSITION_CREATE), createPosition)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.POSITION_UPDATE), updatePosition)
router.delete('/delete/:id', authMiddleware, authorize(PERMISSIONS.POSITION_DELETE), deletePosition)

export default router