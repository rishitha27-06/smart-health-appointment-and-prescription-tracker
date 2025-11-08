import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import Appointment from "../models/appointmentModel.js";
import ChatThread from "../models/chatThreadModel.js";
import Prescription from "../models/prescriptionModel.js";
import MedicalRecord from "../models/medicalRecordModel.js";
import User from "../models/userModel.js";
import ChatRequest from "../models/chatRequestModel.js";

const router = express.Router();

// GET /api/doctor/patients - unique patients for this doctor
router.get("/patients", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const doctorId = req.user._id;

    const [appts, threads, scripts, chatReqs] = await Promise.all([
      Appointment.find({ doctorId }).select("patientId date time status createdAt updatedAt"),
      ChatThread.find({ doctorId }).select("patientId lastMessageAt updatedAt"),
      Prescription.find({ doctorId }).select("patientId createdAt"),
      ChatRequest.find({ doctorId, status: "Pending" }).select("patientId createdAt"),
    ]);

    const map = new Map(); // patientId -> { patientId, lastInteraction }

    const consider = (pid, d) => {
      const key = String(pid);
      const prev = map.get(key);
      const dt = d ? new Date(d) : null;
      if (!prev || (dt && dt > prev.lastInteraction)) {
        map.set(key, { patientId: pid, lastInteraction: dt || prev?.lastInteraction || new Date(0) });
      }
    };

    appts.forEach(a => consider(a.patientId, `${a.date} ${a.time}`));
    threads.forEach(t => consider(t.patientId, t.lastMessageAt || t.updatedAt));
    scripts.forEach(p => consider(p.patientId, p.createdAt));
    chatReqs.forEach(r => consider(r.patientId, r.createdAt));

    const ids = Array.from(map.keys());
    const users = await User.find({ _id: { $in: ids } }).select("_id name email");
    const userById = new Map(users.map(u => [String(u._id), u]));

    const list = ids.map(id => ({
      patient: userById.get(id),
      lastInteraction: map.get(id).lastInteraction,
    }))
    .filter(x => !!x.patient)
    .sort((a,b) => (b.lastInteraction?.getTime()||0) - (a.lastInteraction?.getTime()||0));

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/doctor/patients/:patientId/history - full history for this doctor+patient
router.get("/patients/:patientId/history", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.patientId;

    const [appointments, prescriptions, records] = await Promise.all([
      Appointment.find({ doctorId, patientId }).sort({ date: -1, time: -1 }),
      Prescription.find({ doctorId, patientId }).sort({ createdAt: -1 }),
      MedicalRecord.find({ patientId }).sort({ createdAt: -1 }),
    ]);

    res.json({ appointments, prescriptions, records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
