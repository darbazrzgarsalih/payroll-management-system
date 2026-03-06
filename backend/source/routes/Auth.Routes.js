import express from 'express'
import rateLimit from 'express-rate-limit'
import { changePassword, getUserProfile, login, logout, forgotPassword, resetPassword } from '../controllers/Auth.Controller.js'
import { authMiddleware } from '../middlewares/Auth.Middleware.js'

const router = express.Router()

// ── Login rate limiter: 10 attempts per 15 minutes per IP ─────────────────────
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,          
    max: 10,                            
    standardHeaders: true,              
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },
})

router.get('/profile', authMiddleware, getUserProfile)
router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.post('/change-password', authMiddleware, changePassword)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router