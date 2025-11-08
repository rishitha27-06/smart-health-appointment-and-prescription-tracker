import mongoose from "mongoose";

const chatRequestSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Pending", "Approved", "Declined"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("ChatRequest", chatRequestSchema);
