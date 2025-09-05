import mongoose, { Schema, Document } from "mongoose";

export interface IScan extends Document {
  userId: string;
  filename: string;
  status: "safe" | "malicious";
  rawReport?: any;
  createdAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    userId: { type: String, required: true },
    filename: { type: String, required: true },
    status: { type: String, enum: ["safe", "malicious"], required: true },
    rawReport: { type: Schema.Types.Mixed }, // store full JSON
  },
  { timestamps: true }
);

export default mongoose.model<IScan>("Scan", ScanSchema);
