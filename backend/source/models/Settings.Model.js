import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
    companyName: { type: String, required: true, trim: true, default: 'High Tech' },
    companyTitle: { type: String, trim: true, default: 'PAYROLL MANAGEMENT SYSTEM' },
    companyLogo: { type: String, trim: true },
    companyAddress: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    companyContact: {
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        website: { type: String, trim: true }
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;
