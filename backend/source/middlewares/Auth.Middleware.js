import User from '../models/User.Model.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import { UnauthorizedError } from '../utils/Error.Classes.js'
const jwtSecret = String(process.env.JWT_SECRET)

export const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new UnauthorizedError('No token found, access denied'));
        }
        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findById(decoded.id)
            .select('_id role employeeID username status');

        if (!user) {
            return next(new UnauthorizedError("User not found"));
        }

        req.user = user;

        next();
    } catch (error) {
        return next(new UnauthorizedError('Not authorized'));
    }
};