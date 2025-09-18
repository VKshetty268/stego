import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  password: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;

  // Admin + stats fields
  isAdmin: boolean;
  filesScanned: number;
  threatsDetected: number;
  remainingScans: number;

  // Google onboarding flag
  needsProfileCompletion: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: null },
    organization: { type: String, default: null },
    password: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    isAdmin: { type: Boolean, default: false },
    filesScanned: { type: Number, default: 0 },
    threatsDetected: { type: Number, default: 0 },
    remainingScans: { type: Number, default: 50 },

    needsProfileCompletion: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);