import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const db_uri = String(process.env.MONGODB_URI)

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database connected successfully")
    } catch (error) {
        console.log(error)
    }
}