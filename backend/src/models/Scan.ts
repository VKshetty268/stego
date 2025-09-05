import mongoose, { Schema, Document } from "mongoose";

export interface IScan extends Document {
  userId: string;
  filename: string;
  status: "safe" | "malicious";
  createdAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    userId: { type: String, required: true },
    filename: { type: String, required: true },
    status: { type: String, enum: ["safe", "malicious"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IScan>("Scan", ScanSchema);
