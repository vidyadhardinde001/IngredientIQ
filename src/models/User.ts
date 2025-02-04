import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    healthIssues: string[];
    allergies: string[];
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    healthIssues: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);