import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatar: { type: String, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 128,
        select: false
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'hr_manager', 'payroll_manager', 'overtime_manager', 'punishment_manager', 'employee'],
        default: 'employee'
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastLogin: { type: Date },
    refreshToken: { type: String, default: '', select: false },
    refreshTokenExpires: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resetOTP: { type: String, select: false },
    resetOTPExpires: { type: Date, select: false },
    employeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    }
}, { timestamps: true })

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

const User = mongoose.model('User', UserSchema)
export default User