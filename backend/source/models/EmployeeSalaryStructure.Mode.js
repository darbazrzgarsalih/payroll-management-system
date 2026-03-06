import mongoose from 'mongoose'

const EmployeeSalaryStructureSchema = new mongoose.Schema({
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    salaryComponentID: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryComponent' },
    payGradeID: { type: mongoose.Schema.Types.ObjectId, ref: 'PayGrade' },
    amount: Number,
    percentageOfComponentCode: String,
    calculationType: {type: String, enum: ['fixed', 'percentage', 'formula'], default: 'fixed'},
    formulaExpression: String,
    formulaDependencies: [String],
    effectiveFrom: {type: Date, required: true},
    effectiveTo: Date,
    applicableFor: { type: [{type: String, enum: ['monthly', 'hourly', 'contract', 'overtime', 'reward']}]},
    employmentTypes: { type: [{type: String, enum: ['Full-time', 'Part-time', 'contract']}]},
    affectsGrossSalary: { type: Boolean, default: true },
    affectsNetSalary: { type: Boolean, default: true },
    showOnPayslip: { type: Boolean, default: true },
    executionOrder: { type: Number, default: 0 },
    minValue: Number,
    maxValue: Number,
    minSalaryLimit: Number,
    maxSalaryLimit: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:  { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true })

const EmployeeSalaryStructure = mongoose.model('EmployeeSalaryStructure', EmployeeSalaryStructureSchema)
export default EmployeeSalaryStructure