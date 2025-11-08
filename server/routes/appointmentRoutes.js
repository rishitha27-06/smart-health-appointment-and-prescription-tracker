import express from "express";
import Appointment from "../models/appointmentModel.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendMail,
} from "../services/emailService.js";
import DoctorProfile from "../models/doctorProfileModel.js";
import User from "../models/userModel.js";
import DoctorBlock from "../models/doctorBlockModel.js";

const router = express.Router();

// Helpers
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

// Parse a YYYY-MM-DD string as a local calendar day, avoiding UTC shift
const parseLocalYMD = (ymd) => {
  if (!ymd) return null;
  const s = String(ymd).slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d); // Local time, midnight
};

const generateSlots = (ranges, durationMins) => {
  const out = [];
  for (const r of ranges) {
    if (!r?.start || !r?.end) continue;
    let cur = toMinutes(r.start);
    const end = toMinutes(r.end);
    while (cur + durationMins <= end) {
      out.push(toHHMM(cur));
      cur += durationMins;
    }
  }
  return out;
};

/* -------------------------------------------------------------------------- */
/* 🟢 BOOK APPOINTMENT                                                        */
/* -------------------------------------------------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date and time are required" });
    }

    // Conflict: check existing appointment for the doctor at date+time
    const conflict = await Appointment.findOne({ doctorId, date, time, status: { $ne: "Cancelled" } });
    if (conflict) return res.status(409).json({ message: "Slot already booked" });

    // Optional: validate against doctor's availability if present
    const profile = await DoctorProfile.findOne({ doctorId });
    if (profile?.slotDurationMins && profile?.availability) {
      const dt = parseLocalYMD(date);
      const weekday = dt?.toLocaleString("en-US", { weekday: "long" });
      const dayRanges = profile.availability?.[weekday] || [];
      const allowed = generateSlots(dayRanges, profile.slotDurationMins);
      if (allowed.length && !allowed.includes(time)) {
        return res.status(400).json({ message: "Selected time is outside doctor's availability" });
      }
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      date,
      time,
      status: "Pending",
    });

    // 🔔 Notify doctor for approval
    const doctor = await User.findById(doctorId).select("name email");
    try {
      await sendMail({
        to: doctor?.email,
        subject: "New appointment request",
        html: `<p>You have a new appointment request from ${req.user.name || 'Patient'} on ${date} at ${time}.</p>`,
      });
    } catch {}

    res.json({ message: "Appointment request sent to doctor for approval", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟡 VIEW APPOINTMENTS                                                       */
/* -------------------------------------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "doctor"
        ? { doctorId: req.user.id }
        : { patientId: req.user.id };

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email");

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔎 GET AVAILABLE SLOTS                                                     */
/* -------------------------------------------------------------------------- */
router.get("/slots", protect, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: "doctorId and date are required" });

    const profile = await DoctorProfile.findOne({ doctorId });
    if (!profile) return res.json({ slots: [] });
    const dt = parseLocalYMD(date);
    const weekday = dt?.toLocaleString("en-US", { weekday: "long" });
    const ranges = profile.availability?.[weekday] || [];
    const duration = profile.slotDurationMins || 15;
    const slots = generateSlots(ranges, duration);

    const booked = await Appointment.find({ doctorId, date, status: { $ne: "Cancelled" } }).select("time");
    const bookedTimes = new Set(booked.map((b) => b.time));

    // Remove blocked intervals
    const blocks = await DoctorBlock.find({ doctorId, date }).select("start end");
    const blockRanges = blocks.map(b => ({ s: toMinutes(b.start), e: toMinutes(b.end) }));
    const available = slots.filter((t) => {
      if (bookedTimes.has(t)) return false;
      const tm = toMinutes(t);
      return !blockRanges.some(r => tm >= r.s && tm < r.e);
    });
    res.json({ slots: available, durationMins: duration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* LIST PENDING REQUESTS                                                      */
/* -------------------------------------------------------------------------- */
router.get("/requests", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view pending requests" });
    }

    const requests = await Appointment.find({ doctorId: req.user.id, status: "Pending" })
      .populate("patientId", "name email");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* APPROVE APPOINTMENT                                                        */
/* -------------------------------------------------------------------------- */
router.put("/approve/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can approve appointments" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "Pending") {
      return res.status(400).json({ message: "Appointment is not pending" });
    }

    appointment.status = "Scheduled";
    await appointment.save();

    // Send confirmation email to patient
    const patient = await User.findById(appointment.patientId).select("name email");
    await sendAppointmentConfirmation(
      {
        doctorName: req.user.name,
        date: appointment.date,
        time: appointment.time,
        location: "Hospital/Clinic",
      },
      { email: patient?.email, name: patient?.name || "Patient" }
    );

    res.json({ message: "Appointment scheduled and email sent!", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* DECLINE APPOINTMENT                                                        */
/* -------------------------------------------------------------------------- */
router.put("/decline/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can decline appointments" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "Pending") {
      return res.status(400).json({ message: "Appointment is not pending" });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Send cancellation email to patient
    const patient = await User.findById(appointment.patientId).select("name email");
    await sendAppointmentCancellation(
      {
        doctorName: req.user.name,
        date: appointment.date,
        time: appointment.time,
      },
      { email: patient?.email, name: patient?.name || "Patient" }
    );

    res.json({ message: "Appointment cancelled and email sent!", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* UPDATE (RESCHEDULE) APPOINTMENT                                            */
/* -------------------------------------------------------------------------- */
router.put("/:id", protect, async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure only the patient or admin can update
    if (
      appointment.patientId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update" });
    }

    // Conflict
    if (date && time) {
      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId: appointment.doctorId,
        date,
        time,
        status: { $ne: "Cancelled" },
      });
      if (conflict) return res.status(409).json({ message: "Slot already booked" });
    }

    // Update values
    appointment.date = date || appointment.date;
    appointment.time = time || appointment.time;
    // Track original if not already set
    if (!appointment.rescheduledFrom) appointment.rescheduledFrom = appointment._id;

    const updatedAppointment = await appointment.save();
    res.json({ message: "Appointment updated", appointment: updatedAppointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* DELETE (CANCEL) APPOINTMENT                                                */
/* -------------------------------------------------------------------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure only the patient or admin can cancel
    if (
      appointment.patientId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to cancel" });
    }

    appointment.status = "Cancelled";
    await appointment.save();
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧮 QUEUE & ETA                                                             */
/* -------------------------------------------------------------------------- */
router.get("/queue", protect, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: "doctorId and date are required" });

    const appts = await Appointment.find({ doctorId, date, status: { $ne: "Cancelled" } })
      .sort({ time: 1 })
      .select("patientId time status");

    const profile = await DoctorProfile.findOne({ doctorId });
    const duration = profile?.slotDurationMins || 15;

    // Build queue with naive ETA: index * duration
    const queue = appts.map((a, idx) => ({
      id: a._id,
      time: a.time,
      status: a.status,
      position: idx + 1,
      etaMinutes: idx * duration,
    }));

    res.json({ durationMins: duration, count: queue.length, queue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
