import mongoose from 'mongoose'

const SalaryComponentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['earning', 'deduction', 'contribution'], default: 'earning' },
    category: { type: String, enum: ['salary', 'allowance', 'reward', 'overtime', 'tax', 'loan', 'insurance', 'other'], default: 'other' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    calculationType: { type: String, enum: ['fixed', 'percentage', 'formula'], default: 'fixed' },
    value: Number,
    percentageOf: String,
    formulaDependencies: [{ type: String }],
    formulaExpression: String,
    affectsGrossSalary: { type: Boolean, default: true },
    affectsNetSalary: { type: Boolean, default: true },
    showOnPayslip: { type: Boolean, default: true },
    taxable: { type: Boolean, default: true },
    statutory: { type: Boolean, default: false },
    printOrder: Number,
    statutory: Boolean,
    countryCode: String,
    taxRuleCode: String,
    applicableFor: { type: [{ type: String, enum: ['monthly', 'hourly', 'contract', 'overtime', 'reward'] }], default: ['monthly'] },
    employmentTypes: { type: [{ type: String, enum: ['Full-time', 'Part-time', 'contract'] }], default: ['Full-time', 'Part-time', 'contract'] },
    minValue: Number,
    maxValue: Number,
    minSalaryLimit: Number,
    maxSalaryLimit: Number,
    overtime: Number,
    deductions: Number,
    reward: Number,
    effectiveFrom: { type: Date, required: true },
    effectiveTo: Date,
    executionOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payGradeID: { type: mongoose.Schema.Types.ObjectId, ref: 'PayGrade', required: true }
}, { timestamps: true })

const SalaryComponent = mongoose.model('SalaryComponent', SalaryComponentSchema)
export default SalaryComponent