import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import ChatRequest from "../models/chatRequestModel.js";
import ChatThread from "../models/chatThreadModel.js";
import Message from "../models/messageModel.js";

const router = express.Router();

/* ------------------------------ Chat Requests ------------------------------ */
// Patient creates a chat request to a doctor
router.post("/requests", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ message: "doctorId is required" });

    const existingPending = await ChatRequest.findOne({ patientId: req.user.id, doctorId, status: "Pending" });
    if (existingPending) return res.json({ message: "Request already pending", request: existingPending });
    // Even if a thread exists, allow a new request (patient may want to re-initiate chat).
    // We only prevent duplicates when there's already a Pending request.
    const request = await ChatRequest.create({ patientId: req.user.id, doctorId });
    res.status(201).json({ message: "Chat request sent", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Doctor views pending requests
router.get("/requests", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const list = await ChatRequest.find({ doctorId: req.user.id, status: "Pending" })
      .sort({ createdAt: -1 })
      .populate("patientId", "name email");
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Doctor approves a request (create/open a thread)
router.put("/requests/:id/approve", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const reqDoc = await ChatRequest.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });
    if (String(reqDoc.doctorId) !== String(req.user.id)) return res.status(403).json({ message: "Not authorized" });
    if (reqDoc.status !== "Pending") return res.status(400).json({ message: "Request not pending" });

    reqDoc.status = "Approved";
    await reqDoc.save();

    const thread = await ChatThread.findOneAndUpdate(
      { patientId: reqDoc.patientId, doctorId: reqDoc.doctorId },
      { $set: { status: "Open" }, $setOnInsert: { patientId: reqDoc.patientId, doctorId: reqDoc.doctorId } },
      { new: true, upsert: true }
    );

    // notify both participants
    try {
      const io = req.app.get("io");
      io?.to(`user:${String(thread.patientId)}`).emit("thread:update", { threadId: String(thread._id) });
      io?.to(`user:${String(thread.doctorId)}`).emit("thread:update", { threadId: String(thread._id) });
    } catch {}

    res.json({ message: "Chat approved", thread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Doctor declines a request
router.put("/requests/:id/decline", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const reqDoc = await ChatRequest.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });
    if (String(reqDoc.doctorId) !== String(req.user.id)) return res.status(403).json({ message: "Not authorized" });
    if (reqDoc.status !== "Pending") return res.status(400).json({ message: "Request not pending" });

    reqDoc.status = "Declined";
    await reqDoc.save();
    res.json({ message: "Chat declined", request: reqDoc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* --------------------------------- Threads -------------------------------- */
// List my threads (patient or doctor)
router.get("/threads", protect, async (req, res) => {
  try {
    const filter = req.user.role === "doctor" ? { doctorId: req.user.id } : { patientId: req.user.id };
    const threads = await ChatThread.find(filter)
      .sort({ updatedAt: -1 })
      .populate("patientId", "name email")
      .populate("doctorId", "name email");
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages in a thread (must be participant)
router.get("/threads/:id/messages", protect, async (req, res) => {
  try {
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    const isParticipant = [String(thread.patientId), String(thread.doctorId)].includes(String(req.user.id));
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

    const messages = await Message.find({ threadId: thread._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message in a thread (must be participant)
router.post("/threads/:id/messages", protect, async (req, res) => {
  try {
    const { text } = req.body;
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    const isParticipant = [String(thread.patientId), String(thread.doctorId)].includes(String(req.user.id));
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });
    if (thread.status === "Closed") return res.status(400).json({ message: "Chat is closed" });
    if (!text || !text.trim()) return res.status(400).json({ message: "text is required" });

    const msg = await Message.create({ threadId: thread._id, senderId: req.user.id, text: text.trim(), readBy: [req.user.id] });
    thread.lastMessageAt = new Date();
    await thread.save();

    // Emit via socket if available
    try {
      const io = req.app.get("io");
      io?.to(`thread:${thread._id}`).emit("message:new", { threadId: String(thread._id), message: msg });
      io?.to(`user:${String(thread.patientId)}`).emit("thread:update", { threadId: String(thread._id) });
      io?.to(`user:${String(thread.doctorId)}`).emit("thread:update", { threadId: String(thread._id) });
    } catch {}

    res.status(201).json({ message: "Sent", data: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Close a chat thread (either participant can close)
router.put("/threads/:id/close", protect, async (req, res) => {
  try {
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    const isParticipant = [String(thread.patientId), String(thread.doctorId)].includes(String(req.user.id));
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });
    thread.status = "Closed";
    await thread.save();
    try {
      const io = req.app.get("io");
      io?.to(`thread:${thread._id}`).emit("thread:update", { threadId: String(thread._id) });
      io?.to(`user:${String(thread.patientId)}`).emit("thread:update", { threadId: String(thread._id) });
      io?.to(`user:${String(thread.doctorId)}`).emit("thread:update", { threadId: String(thread._id) });
    } catch {}
    res.json({ message: "Chat closed", thread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reopen a chat thread (either participant can reopen)
router.put("/threads/:id/reopen", protect, async (req, res) => {
  try {
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    const isParticipant = [String(thread.patientId), String(thread.doctorId)].includes(String(req.user.id));
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });
    thread.status = "Open";
    await thread.save();
    try {
      const io = req.app.get("io");
      io?.to(`thread:${thread._id}`).emit("thread:update", { threadId: String(thread._id) });
      io?.to(`user:${String(thread.patientId)}`).emit("thread:update", { threadId: String(thread._id) });
      io?.to(`user:${String(thread.doctorId)}`).emit("thread:update", { threadId: String(thread._id) });
    } catch {}
    res.json({ message: "Chat reopened", thread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
