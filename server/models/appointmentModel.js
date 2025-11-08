import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String, // YYYY-MM-DD
  time: String, // HH:mm
  status: { type: String, enum: ["Pending", "Scheduled", "Completed", "Cancelled", "NoShow"], default: "Pending" },
  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
});

export default mongoose.model("Appointment", appointmentSchema);
