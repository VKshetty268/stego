import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  phone?: string;
  organization?: string;
  password: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;

  // Admin + stats fields
  isAdmin: boolean;
  filesScanned: number;
  threatsDetected: number;
  remainingScans: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    organization: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    isAdmin: { type: Boolean, default: false },
    filesScanned: { type: Number, default: 0 },
    threatsDetected: { type: Number, default: 0 },
    remainingScans: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
