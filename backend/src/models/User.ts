// src/models/user.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  phone?: string;
  organization?: string;
  password?: string; // ✅ now optional
  provider?: string; // "local" | "google" | "apple"
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    organization: { type: String },
    password: { type: String }, // ✅ removed required:true
    provider: { type: String, default: "local" }, // ✅ new field
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
