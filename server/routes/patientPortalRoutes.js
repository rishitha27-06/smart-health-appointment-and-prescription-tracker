import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import Appointment from "../models/appointmentModel.js";
import ChatThread from "../models/chatThreadModel.js";
import Prescription from "../models/prescriptionModel.js";
import MedicalRecord from "../models/medicalRecordModel.js";
import User from "../models/userModel.js";
import ChatRequest from "../models/chatRequestModel.js";

const router = express.Router();

// GET /api/patient/doctors - unique doctors this patient interacted with
router.get("/doctors", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const patientId = req.user._id;

    const [appts, threads, scripts, chatReqs] = await Promise.all([
      Appointment.find({ patientId }).select("doctorId date time status createdAt updatedAt"),
      ChatThread.find({ patientId }).select("doctorId lastMessageAt updatedAt"),
      Prescription.find({ patientId }).select("doctorId createdAt"),
      ChatRequest.find({ patientId, status: "Pending" }).select("doctorId createdAt"),
    ]);

    const map = new Map(); // doctorId -> { doctorId, lastInteraction }
    const consider = (did, d) => {
      const key = String(did);
      const prev = map.get(key);
      const dt = d ? new Date(d) : null;
      if (!prev || (dt && dt > prev.lastInteraction)) {
        map.set(key, { doctorId: did, lastInteraction: dt || prev?.lastInteraction || new Date(0) });
      }
    };

    appts.forEach(a => consider(a.doctorId, `${a.date} ${a.time}`));
    threads.forEach(t => consider(t.doctorId, t.lastMessageAt || t.updatedAt));
    scripts.forEach(p => consider(p.doctorId, p.createdAt));
    chatReqs.forEach(r => consider(r.doctorId, r.createdAt));

    const ids = Array.from(map.keys());
    const users = await User.find({ _id: { $in: ids } }).select("_id name email specialization");
    const byId = new Map(users.map(u => [String(u._id), u]));

    const list = ids.map(id => ({
      doctor: byId.get(id),
      lastInteraction: map.get(id).lastInteraction,
    }))
    .filter(x => !!x.doctor)
    .sort((a,b) => (b.lastInteraction?.getTime()||0) - (a.lastInteraction?.getTime()||0));

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/patient/doctors/:doctorId/history - history with a doctor for this patient
router.get("/doctors/:doctorId/history", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const patientId = req.user._id;
    const doctorId = req.params.doctorId;

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
