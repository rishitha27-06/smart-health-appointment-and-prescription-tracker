import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import DoctorBlock from "../models/doctorBlockModel.js";

const router = express.Router();

// Create a blocked time (doctor only)
router.post("/", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { date, start, end, reason } = req.body;
    if (!date || !start || !end) return res.status(400).json({ message: "date, start, end are required" });

    const block = await DoctorBlock.create({ doctorId: req.user.id, date, start, end, reason });
    res.status(201).json({ message: "Blocked time added", block });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List blocked times (doctor only) with optional date filter
router.get("/", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { doctorId: req.user.id };
    if (date) filter.date = date;
    const blocks = await DoctorBlock.find(filter).sort({ date: 1, start: 1 });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a block
router.delete("/:id", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const block = await DoctorBlock.findOne({ _id: req.params.id, doctorId: req.user.id });
    if (!block) return res.status(404).json({ message: "Block not found" });
    await block.deleteOne();
    res.json({ message: "Blocked time removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
