import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const db_uri = String(process.env.MONGODB_URI)

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect('mongodb+srv://darbo:darbo123@payroll.rocai76.mongodb.net/payroll?appName=payroll')
        console.log("Database connected successfully")
    } catch (error) {
        console.log(error)
    }
}