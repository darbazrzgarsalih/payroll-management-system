import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
import { createPunishment, getAllPunishments, getSinglePunishment, updatePunishment, voidPunishment } from '../controllers/Punishment.Controller.js';

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.PUNISHMENT_VIEW), getAllPunishments)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.PUNISHMENT_VIEW), getSinglePunishment)
router.post('/', authMiddleware, authorize(PERMISSIONS.PUNISHMENT_CREATE), createPunishment)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.PUNISHMENT_UPDATE), updatePunishment)
router.patch('/void/:id', authMiddleware, authorize(PERMISSIONS.PUNISHMENT_VOID), voidPunishment)

export default router