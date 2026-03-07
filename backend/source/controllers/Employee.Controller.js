import mongoose from 'mongoose';
import Employee from '../models/Employee.Model.js';
import { BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from '../utils/Error.Classes.js';
import { logAudit } from '../utils/Audit.Logger.js';
import User from '../models/User.Model.js'
import bcrypt from 'bcrypt'
import csv from 'csv-parser'
import { Readable } from 'stream'


export const getAllEmployees = async (req, res, next) => {
    try {
        const { search, status } = req.query
        const page = Number(req.query.page || 1)
        const limit = Number(req.query.limit || 10)
        const sort = '-createdAt'
        const skip = (page - 1) * limit

        let queryObject = {}

        if (search) {
            queryObject.$or = [
                { "personalInfo.firstName": { $regex: search, $options: "i" } },
                { "personalInfo.lastName": { $regex: search, $options: "i" } },
                { employeeCode: { $regex: search, $options: "i" } },
                { "personalInfo.email": { $regex: search, $options: "i" } }
            ]
        }

        if (status) {
            queryObject['employmentInfo.status'] = status
        }

        const employees = await Employee.find(queryObject)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .populate('updatedBy', 'username')
            .populate('createdBy', 'username')
            .populate('employmentInfo.departmentID', 'name')
            .populate('employmentInfo.positionID', 'title')
            .populate('employmentInfo.managerID', 'personalInfo.firstName personalInfo.lastName')
            .populate('userID', 'username')
            .populate('shiftId', 'name')

        const transformedEmployee = employees.map((e) => {
            return {
                id: e._id.toString(),

                firstName: e.personalInfo?.firstName,
                middleName: e.personalInfo?.middleName,
                lastName: e.personalInfo?.lastName,
                employeeName: [
                    e.personalInfo?.firstName,
                    e.personalInfo?.middleName,
                    e.personalInfo?.lastName,
                ].filter(Boolean).join(" "),
                avatar: e.personalInfo?.avatar,

                dob: e.personalInfo?.dateOfBirth,
                gender: e.personalInfo?.gender,
                phone: e.personalInfo?.phone,
                email: e.personalInfo?.email,
                address: e.personalInfo.address,
                userID: e.userID?.username ?? null,
                hireDate: e.employmentInfo?.hireDate,
                employmentType: e.employmentInfo?.employmentType,
                position: e.employmentInfo?.positionID?.title ?? null,
                department: e.employmentInfo?.departmentID?.name ?? null,
                shift: e.shiftId?.name ?? "No shift",
                status: e.employmentInfo?.status,
            }
        })


        const total = await Employee.countDocuments(queryObject)

        return res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            employees: transformedEmployee
        })

    } catch (error) {

        return next(new InternalServerError("Could not fetch employees, please try again."))
    }
}

export const getSingleEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Employee ID is required"))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid Employee ID"))
        }

        const employee = await Employee.findById(id)
            .populate('createdBy', 'firstName lastName username')
            .populate('updatedBy', 'firstName lastName username')
            .populate('userID', 'username email role')
            .populate('employmentInfo.departmentID', 'name')
            .populate('employmentInfo.positionID', 'title')
            .populate('employmentInfo.managerID', 'personalInfo.firstName personalInfo.lastName employeeCode')

        if (!employee) {
            return next(new NotFoundError("Employee not found."))
        }

        return res.status(200).json({
            success: true,
            message: "Employee found.",
            employee
        })
    } catch (error) {

        return next(new InternalServerError("Could not fetch employee, please try again."))
    }
}


export const getEmployeeByCode = async (req, res, next) => {
    try {
        const { code } = req.params;

        if (!code) {
            return next(new BadRequestError("Employee code is required."))
        }

        const employee = await Employee.findOne({ employeeCode: code })
            .populate('employmentInfo.departmentID', 'name')
            .populate('employmentInfo.positionID', 'title')
            .populate('employmentInfo.managerID', 'personalInfo.firstName personalInfo.lastName')

        if (!employee) {
            return next(new NotFoundError("Employee not found."))
        }

        return res.status(200).json({
            success: true,
            message: `Employee found with code ${code}`,
            employee
        })
    } catch (error) {

        return next(new InternalServerError("Could not fetch employee, please try again."))
    }
}

export const createEmployee = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const {
            employeeCode,
            firstName,
            middleName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            email,
            street,
            city,
            state,
            country,
            zipCode,
            hireDate,
            employmentType,
            workSchedule,
            departmentID,
            positionID,
            managerID,


            createAccount,
            username,
            password,
            role,
            shiftId
        } = req.body

        if (!employeeCode || !firstName || !lastName || !dateOfBirth || !email || !hireDate) {
            throw new BadRequestError("Required employee fields are missing.")
        }

        const existingEmployee = await Employee.findOne({
            $or: [
                { employeeCode },
                { 'personalInfo.email': email }
            ]
        }).session(session)

        if (existingEmployee) {
            throw new BadRequestError("Employee with this code or email already exists.")
        }

        const employee = await Employee.create([{
            employeeCode: employeeCode.trim(),
            personalInfo: {
                firstName: firstName.trim(),
                middleName: middleName?.trim(),
                lastName: lastName.trim(),
                avatar: req.file ? `documents/employees/${req.file.filename}` : undefined,
                dateOfBirth,
                gender,
                phone,
                email: email.toLowerCase().trim(),
                address: {
                    street,
                    city,
                    state,
                    country,
                    zipCode
                }
            },
            employmentInfo: {
                hireDate,
                employmentType,
                workSchedule,
                departmentID,
                positionID,
                managerID
            },
            shiftId,
            createdBy: req.user._id,
            updatedBy: req.user._id
        }], { session })

        let createdUser = null

        if (createAccount === 'true' || createAccount === true) {

            if (!username || !password || !role) {
                throw new BadRequestError("Username, password, and role required to create account.")
            }

            const existingUser = await User.findOne({
                $or: [{ username }, { email }]
            }).session(session)

            if (existingUser) {
                throw new BadRequestError("User with this username or email already exists.")
            }

            const salt = await bcrypt.genSalt(12)
            const hashedPassword = await bcrypt.hash(password, salt)

            createdUser = await User.create([{
                username: username.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role,
                employeeID: employee[0]._id,
                createdBy: req.user._id,
                updatedBy: req.user._id
            }], { session })


            employee[0].userID = createdUser[0]._id
            await employee[0].save({ session })
        }

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee: employee[0],
            user: createdUser ? createdUser[0] : null
        })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        return next(error)
    }
}


export const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Employee ID is required."))
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid employee ID."))
        }

        const allowedUpdates = [
            'personalInfo.firstName',
            'personalInfo.middleName',
            'personalInfo.lastName',
            'personalInfo.avatar',
            'personalInfo.email',
            'personalInfo.phone',
            'personalInfo.gender',
            'personalInfo.address.street',
            'personalInfo.address.city',
            'personalInfo.address.country',
            'personalInfo.address.zipCode',
            'personalInfo.address.state',
            'employmentInfo.workSchedule',
            'employmentInfo.departmentID',
            'employmentInfo.managerID',
            'employmentInfo.positionID',
            'employmentInfo.employmentType',
            'employmentInfo.status',
        ]

        const buildUpdateObject = (updates, allowedFields) => {
            const updateObj = {}
            for (const field of allowedFields) {
                if (updates[field] !== undefined && updates[field] !== '') {
                    updateObj[field] = typeof updates[field] === 'string'
                        ? updates[field].trim()
                        : updates[field]
                }
            }
            return updateObj
        }

        const updateData = buildUpdateObject(req.body, allowedUpdates)

        if (req.file) {
            updateData['personalInfo.avatar'] = `documents/employees/${req.file.filename}`
        }

        if (Object.keys(updateData).length === 0) {
            return next(new BadRequestError("No valid update data provided"))
        }

        if (updateData['personalInfo.email']) {
            const existingEmployee = await Employee.findOne({
                _id: { $ne: id },
                'personalInfo.email': updateData['personalInfo.email']
            })

            if (existingEmployee) {
                return next(new BadRequestError("Email already exists."))
            }
        }

        const employee = await Employee.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    ...updateData,
                    updatedBy: req.user._id
                }
            },
            { runValidators: true, new: true }
        ).populate('employmentInfo.departmentID', 'name')
            .populate('employmentInfo.positionID', 'title')
            .populate('employmentInfo.managerID', 'personalInfo.firstName personalInfo.lastName')

        if (!employee) {
            return next(new NotFoundError("Employee not found."))
        }

        await logAudit({
            req,
            action: 'UPDATE',
            entity: 'Employee',
            entityID: employee._id,
            newValue: employee
        })

        return res.status(200).json({
            success: true,
            message: "Employee has been updated successfully",
            employee
        })

    } catch (error) {

        next(new InternalServerError("Could not update employee, please try again"))
    }
}

export const terminateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;;

        if (!id) {
            return next(new BadRequestError("Employee ID is required."));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid employee ID."));
        }
        const employee = await Employee.findByIdAndUpdate(
            id,
            {
                $set: {
                    "employmentInfo.status": 'terminated',
                    "employmentInfo.terminationDate": new Date(),
                    updatedBy: req.user._id
                }
            },
            { runValidators: true, new: true }
        );

        if (!employee) {
            return next(new NotFoundError("Employee not found."));
        }

        await logAudit({
            req,
            action: 'TERMINATE',
            entity: 'Employee',
            entityID: employee._id,
            newValue: employee
        })

        return res.status(200).json({
            success: true,
            message: `Employee terminated`,
            employee
        });

    } catch (error) {

        return next(
            new InternalServerError("Could not terminate employee, please try again.")
        );
    }
};

export const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new BadRequestError("Employee ID is required."));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequestError("Invalid employee ID."));
        }

        const employee = await Employee.findOneAndDelete({ _id: id })

        if (!employee) {
            return next(new NotFoundError("Employee not found."))
        }

        return res.status(200).json({
            success: true,
            message: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName} has been deleted.`
        })
    } catch (error) {

        return next(new InternalServerError("Could not delete employee, please try again."))
    }
}



export const getEmployeeProfile = async (req, res, next) => {
    try {
        if (req.user.role !== 'employee') {
            return next(new UnauthorizedError("Access denied. Only employees can view their profile."))
        }

        const employee = await Employee.findOne({ userID: req.user._id })
            .populate('employmentInfo.departmentID', 'name')
            .populate('employmentInfo.positionID', 'title')
            .populate('employmentInfo.managerID', 'personalInfo.firstName personalInfo.lastName employeeCode')

        if (!employee) {
            return next(new NotFoundError("Employee profile not found"))
        }

        return res.status(200).json({
            success: true,
            message: "Employee profile fetched successfully",
            employee
        })
    } catch (error) {
        console.error(error)
        return next(
            new InternalServerError("Could not fetch employee profile")
        )
    }
}

export const importEmployeesCSV = async (req, res, next) => {
    if (!req.file) {
        return next(new BadRequestError("No CSV file uploaded."));
    }

    const results = [];
    const errors = [];

    const stream = Readable.from(req.file.buffer);

    stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const session = await mongoose.startSession();
            session.startTransaction();
            let importedCount = 0;

            try {
                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    const employeeCode = row.employeeCode?.trim();
                    const firstName = row.firstName?.trim();
                    const lastName = row.lastName?.trim();
                    const email = row.email?.trim().toLowerCase();
                    const hireDate = row.hireDate?.trim();
                    const dateOfBirth = row.dateOfBirth?.trim();

                    if (!employeeCode || !firstName || !lastName || !email || !hireDate || !dateOfBirth) {
                        errors.push(`Row ${i + 2}: Missing required fields (employeeCode, firstName, lastName, email, hireDate, dateOfBirth).`);
                        continue;
                    }

                    const existing = await Employee.findOne({
                        $or: [{ employeeCode }, { 'personalInfo.email': email }]
                    }).session(session);

                    if (existing) {
                        errors.push(`Row ${i + 2}: Employee code (${employeeCode}) or email (${email}) already exists.`);
                        continue;
                    }

                    let gender = row.gender?.trim() || 'Male';
                    if (!['Male', 'Female'].includes(gender)) gender = 'Male';

                    let employmentType = row.employmentType?.trim() || 'Full-time';
                    const validTypes = ['Full-time', 'Part-time', 'contract', 'intern'];
                    if (!validTypes.includes(employmentType)) employmentType = 'Full-time';

                    await Employee.create([{
                        employeeCode,
                        personalInfo: {
                            firstName,
                            lastName,
                            email,
                            dateOfBirth,
                            gender,
                            phone: row.phone?.trim() || '',
                        },
                        employmentInfo: {
                            hireDate,
                            employmentType,
                            status: row.status?.trim() || 'active'
                        },
                        createdBy: req.user._id,
                        updatedBy: req.user._id
                    }], { session });

                    importedCount++;
                }

                await session.commitTransaction();
                session.endSession();

                return res.status(200).json({
                    success: errors.length === 0,
                    message: `Import complete. ${importedCount} employees imported. ${errors.length} errors.`,
                    errors
                });

            } catch (err) {
                await session.abortTransaction();
                session.endSession();

                return next(new InternalServerError("Error processing CSV data: " + err.message));
            }
        });
};