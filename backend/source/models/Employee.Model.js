import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    employeeCode: { type: String, required: true, unique: true, trim: true },
    personalInfo: {
        firstName: { type: String, required: true, trim: true },
        middleName: { type: String, trim: true },
        lastName: { type: String, required: true, trim: true },
        avatar: { type: String, trim: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
        phone: { type: String, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
    },

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true
    },


    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    employmentInfo: {
        hireDate: { type: Date, required: true },
        terminationDate: Date,
        employmentType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'contract', 'intern'],
            default: 'Full-time'
        },
        workSchedule: {
            type: String,
            enum: ['regular', 'shift', 'flexible'],
            default: 'regular'
        },
        probationEndDate: Date,
        positionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
        departmentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
        managerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        status: {
            type: String,
            enum: ['active', 'inactive', 'on_leave', 'suspended', 'terminated'],
            default: 'active'
        }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })


EmployeeSchema.index({ employeeCode: 1 });
EmployeeSchema.index({ 'personalInfo.email': 1 });
EmployeeSchema.index({ userID: 1 });

const Employee = mongoose.model('Employee', EmployeeSchema)
export default Employee