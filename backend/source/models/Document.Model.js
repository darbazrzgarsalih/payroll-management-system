import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema({
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['contract', 'certificate', 'id_proof', 'tax_form', 'policy', 'other'], default: 'other' },
    name: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    fileSize: Number,
    mimeType: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiryDate: Date,
    isConfidential: Boolean,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const Document = mongoose.model('Document', DocumentSchema)
export default Document