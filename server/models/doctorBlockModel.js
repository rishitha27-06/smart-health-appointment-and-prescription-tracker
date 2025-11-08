import mongoose from "mongoose";

const doctorBlockSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true },   // HH:mm
    reason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("DoctorBlock", doctorBlockSchema);
