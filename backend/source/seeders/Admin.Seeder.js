import bcrypt from 'bcrypt'
import User from '../models/User.Model.js'
import { connectDB } from '../configuration/Database.js'

export const registerUser = async () => {
    await connectDB()
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
        
    } catch (error) {
        console.log(error)
    }
}

registerUser()