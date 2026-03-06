import mongoose from "mongoose";
import User from "./source/models/User.Model.js";
import Employee from "./source/models/Employee.Model.js";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms";

const seedAvatars = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for seeding fake avatars.");

        const users = await User.find({});
        for (const user of users) {
            const avatarUrl = `https://i.pravatar.cc/150?u=${user._id.toString()}`;
            await User.updateOne({ _id: user._id }, { $set: { avatar: avatarUrl } });
        }
        console.log(`Updated ${users.length} users with fake avatars.`);

        const employees = await Employee.find({});
        for (const employee of employees) {
            const avatarUrl = `https://i.pravatar.cc/150?u=${employee._id.toString()}`;
            await Employee.updateOne({ _id: employee._id }, { $set: { "personalInfo.avatar": avatarUrl } });
        }
        console.log(`Updated ${employees.length} employees with fake avatars.`);

    } catch (err) {
        console.error("Error setting up fake avatars:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

seedAvatars();
