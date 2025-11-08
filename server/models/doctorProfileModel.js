import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  day: { type: String, required: true }, // Example: "Monday"
  startTime: { type: String, required: true }, // Example: "10:00 AM"
  endTime: { type: String, required: true },   // Example: "1:00 PM"
});

const doctorProfileSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialization: { type: String },
  experience: { type: Number },
  bio: { type: String },
  location: { type: String },
  slots: [slotSchema], // legacy/day-range availability
  slotDurationMins: { type: Number, default: 15 },
  // Optional weekly availability matrix: keys are weekday names -> array of { start:"HH:mm", end:"HH:mm" }
  availability: {
    Monday: [{ start: { type: String }, end: { type: String } }],
    Tuesday: [{ start: { type: String }, end: { type: String } }],
    Wednesday: [{ start: { type: String }, end: { type: String } }],
    Thursday: [{ start: { type: String }, end: { type: String } }],
    Friday: [{ start: { type: String }, end: { type: String } }],
    Saturday: [{ start: { type: String }, end: { type: String } }],
    Sunday: [{ start: { type: String }, end: { type: String } }],
  },
});

export default mongoose.model("DoctorProfile", doctorProfileSchema);
