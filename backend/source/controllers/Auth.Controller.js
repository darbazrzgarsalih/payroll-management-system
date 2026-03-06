import User from '../models/User.Model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from '../utils/Error.Classes.js'
import { logAudit } from '../utils/Audit.Logger.js'
import { sendPasswordResetEmail } from '../services/Email.Service.js'

dotenv.config()
const jwtExpire = String(process.env.JWT_EXPIRE || '7d')
const jwtSecret = String(process.env.JWT_SECRET)
const nodeENV = process.env.NODE_ENV === 'production'
const jwtExpireMs = 7 * 24 * 60 * 60 * 1000

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return next(new BadRequestError("Username and password are required for login."))
        }

        const user = await User.findOne({ username: username.trim() }).select('+password')

        if (!user) {
            await bcrypt.compare('dummy', '$2b$10$darbohashdarbohashdarboh')
            return next(new UnauthorizedError("Incorrect username or password"))
        }

        if (user.status !== 'active') {
            return next(new UnauthorizedError("Account is inactive"))
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            return next(new UnauthorizedError("Incorrect username or password"))
        }

        user.lastLogin = new Date()
        await user.save()

        const token = jwt.sign({ id: user._id }, jwtSecret, {
            expiresIn: jwtExpire
        })

        res.cookie('token', token, {
            httpOnly: true,
            secure: nodeENV,
            sameSite: 'strict',
            maxAge: jwtExpireMs
        })

        await logAudit({
            req,
            action: 'LOGIN',
            entity: 'User',
            entityID: user._id,
            newValue: user
        })

        return res.status(200).json({
            success: true,
            message: `Logged in as ${user.username}`,
            user
        })

    } catch (error) {
        return next(new InternalServerError("Could not login, please try again."))
    }
}

export const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: nodeENV,
            sameSite: 'strict',
        })



        await logAudit({
            req,
            action: 'LOGOUT',
            entity: 'User',
            entityID: '',
            newValue: ''
        })

        res.status(200).json({
            success: true,
            message: `Logged out.`,
        })
    } catch (error) {
        
        return next(new InternalServerError("Could not logout, please try again."))
    }
}

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return next(new BadRequestError("Current password, new password, and confirm password are required."))
        }

        const user = await User.findById(req.user._id).select('+password')

        if (!user) {
            return next(new NotFoundError("User not found"))
        }

        if (newPassword !== confirmPassword) {
            return next(new BadRequestError("New password and confirm password must match."))
        }

        if (newPassword.length < 8) {
            return next(new BadRequestError("New password must contain at least 8 characters."))
        }

        if (newPassword === currentPassword) {
            return next(new BadRequestError("New password should not be same as current"))
        }

        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)

        if (!isPasswordMatch) {
            return next(new BadRequestError("Incorrect current password"))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;

        await user.save()

        return res.status(200).json({
            success: true,
            message: "Your password has been changed successfully.",
        })

    } catch (error) {
        
        return next(new InternalServerError("Could not change password, please try again."))
    }
}

export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'employeeID',
            populate: [
                { path: 'employmentInfo.departmentID', select: 'name' },
                { path: 'employmentInfo.positionID', select: 'title' },
                { path: 'employmentInfo.managerID', select: 'personalInfo.firstName personalInfo.lastName' }
            ]
        })

        if (!user) {
            return next(new NotFoundError("Profile not found."))
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                status: user.status,
                avatar: user.avatar,
                lastLogin: user.lastLogin,
                employee: user.employeeID || null
            }
        })
    } catch (error) {
        return next(new InternalServerError("Could not fetch profile, please try again"))
    }
}

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next(new BadRequestError('Email is required'));

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            
            return res.status(200).json({ success: true, message: 'If this email exists, a 6-digit code has been sent.' });
        }

        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        user.resetOTP = hashedOTP;
        user.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000); 
        await user.save();

        try {
            
            await sendPasswordResetEmail({ to: user.email, name: user.firstName || user.username, otp });
            
        } catch (emailError) {
            console.error(`[forgotPassword] Failed to send email to ${user.email}:`, emailError.message);
            
            
        }

        return res.status(200).json({ success: true, message: 'If this email exists, a 6-digit code has been sent.' });
    } catch (error) {
        console.error('[forgotPassword]', error);
        return next(new InternalServerError('Could not process password reset request'));
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, password, confirmPassword } = req.body;

        if (!email || !otp || !password || !confirmPassword) {
            return next(new BadRequestError('All fields (email, otp, password, confirmPassword) are required'));
        }

        if (password !== confirmPassword) return next(new BadRequestError('Passwords do not match'));
        if (password.length < 8) return next(new BadRequestError('Password must be at least 8 characters'));

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            resetOTP: hashedOTP,
            resetOTPExpires: { $gt: new Date() },
        }).select('+resetOTP +resetOTPExpires +password');

        if (!user) return next(new BadRequestError('OTP is invalid or has expired'));

        const isSame = await bcrypt.compare(password, user.password);
        if (isSame) return next(new BadRequestError('New password must differ from current password'));

        user.password = await bcrypt.hash(password, 10);
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        await logAudit({ req, action: 'RESET_PASSWORD', entity: 'User', entityID: user._id });

        return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('[resetPassword]', error);
        return next(new InternalServerError('Could not reset password'));
    }
}