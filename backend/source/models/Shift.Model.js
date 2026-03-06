import mongoose from 'mongoose'

const ShiftSchema = new mongoose.Schema({
    name: String,                
    code: String,                

    startTime: String,           // "09:00"
    endTime: String,             // "17:00"

    breakMinutes: Number,        
    gracePeriodMinutes: Number,  

    workDays: [String],          

    isNightShift: Boolean,       

    overtimeThresholdMinutes: Number,  

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },

    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId
})

const Shift = mongoose.model('Shift', ShiftSchema)
export default Shift