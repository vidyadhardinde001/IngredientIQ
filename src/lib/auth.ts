import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export const registerUser = async (
    username: string, 
    email: string, 
    password: string, 
    healthIssues: string[],
    allergies: string[]
) => {
    try {
        await connectDB();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: "Email already in use" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
            username, 
            email, 
            password: hashedPassword, 
            healthIssues,
            allergies 
        });
        await user.save();

        return { message: "User registered successfully", user };
    } catch (error) {
        console.error("Register Error:", error);
        return { error: "Registration failed" };
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        await connectDB();
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        // Updated JWT payload with health data
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                healthData: {
                    healthIssues: user.healthIssues,
                    allergies: user.allergies
                }
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return token;
    } catch (error: any) {
        console.error("Login Error:", error);
        throw new Error(error.message || "Login failed");
    }
};