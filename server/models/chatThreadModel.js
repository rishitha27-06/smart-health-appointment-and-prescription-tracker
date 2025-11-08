import mongoose from "mongoose";

const chatThreadSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

chatThreadSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

export default mongoose.model("ChatThread", chatThreadSchema);
