import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { createBulkRewards, createReward, getAllRewards, getSingleReward, updateReward, voidReward } from '../controllers/Reward.Controller.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';
const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.REWARD_VIEW), getAllRewards)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.REWARD_VIEW), getSingleReward)
router.post('/', authMiddleware, authorize(PERMISSIONS.REWARD_CREATE), createReward)
router.post('/bulk', authMiddleware, authorize(PERMISSIONS.REWARD_CREATE), createBulkRewards)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.REWARD_UPDATE), updateReward)
router.patch('/void/:id', authMiddleware, authorize(PERMISSIONS.REWARD_VOID), voidReward)

export default router