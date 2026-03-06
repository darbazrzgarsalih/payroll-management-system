import bcrypt from 'bcrypt'
import User from '../models/User.Model.js'
import { connectDB } from '../configuration/Database.js'

export const registerUser = async () => {
    try {
        const hashedPassword = await bcrypt.hash("123", 10)
        const user = new User({
            username: "rebo",
            firstName: "Rebaz",
            lastName: "Rzgar",
            email: "rebaz@gmail.com",
            password: hashedPassword,
            role: 'super_admin',
        })

        await user.save()
        console.log("Admin account 'rebo' created successfully")
    } catch (error) {
        if (error.code === 11000) {
            console.log("Admin account already exists, skipping seed")
        } else {
            console.log("Seed error:", error.message)
        }
    }
}