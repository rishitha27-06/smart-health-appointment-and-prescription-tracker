import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import Notice from "../models/noticeModel.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup multer storage (local uploads)
const uploadDir = path.resolve(process.cwd(), "uploads/notices");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

// Upload single attachment
router.post("/upload", protect, authorizeRoles("doctor", "faculty", "admin"), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const file = req.file;
  const fileUrl = `/uploads/notices/${file.filename}`;
  return res.status(201).json({ filename: file.filename, path: file.path, url: fileUrl });
});

// Create notice (faculty/admin)
router.post("/", protect, authorizeRoles("faculty", "doctor", "admin"), async (req, res) => {
  try {
    const { title, content, category, targetRoles, targetDepartments, targetYears, attachments, scheduledAt } = req.body;

    if (!title || !content) return res.status(400).json({ message: "title and content are required" });

    const notice = await Notice.create({
      title,
      content,
      category: category || "General",
      targetRoles: Array.isArray(targetRoles) ? targetRoles : (targetRoles ? [targetRoles] : ["student","faculty","admin"]),
      targetDepartments: Array.isArray(targetDepartments) ? targetDepartments : (targetDepartments ? [targetDepartments] : []),
      targetYears: Array.isArray(targetYears) ? targetYears : (targetYears ? [Number(targetYears)] : []),
      attachments: attachments || [],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      authorId: req.user._id,
      // If author is admin and no scheduledAt provided, auto-approve
      approved: req.user.role === "admin" && !scheduledAt,
      publishedAt: req.user.role === "admin" && !scheduledAt ? new Date() : undefined,
    });

    // If auto-approved & published, emit socket
    if (notice.approved && notice.publishedAt) {
      const io = req.app.get("io");
      if (io) io.emit("new-notice", { id: notice._id, title: notice.title, category: notice.category });
    }

    res.status(201).json({ message: "Notice created", notice });
  } catch (err) {
    console.error("Create notice error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Approve & publish (admin only)
router.post("/:id/approve", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    notice.approved = true;
    notice.publishedAt = new Date();
    await notice.save();

    // emit socket event
    const io = req.app.get("io");
    if (io) io.emit("new-notice", { id: notice._id, title: notice.title, category: notice.category });

    // send email notification optionally
    if (process.env.EMAIL && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
        });

        // NOTE: For MVP we send a single/admin-level email. Integrate with user lists later.
        await transporter.sendMail({
          from: `"SCNBCP" <${process.env.EMAIL}>`,
          to: process.env.EMAIL,
          subject: `Notice published: ${notice.title}`,
          text: `${notice.title}\n\n${notice.content}`,
        });
      } catch (emailErr) {
        console.error("Notice email error:", emailErr);
      }
    }

    res.json({ message: "Notice approved and published", notice });
  } catch (err) {
    console.error("Approve notice error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get notices (public: only published)
router.get("/", async (req, res) => {
  try {
    const { category, department, role, skip = 0, limit = 50 } = req.query;

    const base = { approved: true, publishedAt: { $exists: true } };
    if (category) base.category = category;
    if (department) base.targetDepartments = department;

    const notices = await Notice.find(base)
      .sort({ publishedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json(notices);
  } catch (err) {
    console.error("Get notices error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get notices for authenticated user (personalized)
router.get("/me", protect, async (req, res) => {
  try {
    const filters = { approved: true, publishedAt: { $exists: true } };
    // filter by user role
    filters.targetRoles = req.user.role;

    // Additional filtering by department/year could be implemented here
    const notices = await Notice.find(filters).sort({ publishedAt: -1 }).limit(100);
    res.json(notices);
  } catch (err) {
    console.error("Get my notices error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Acknowledge a notice
router.post("/:id/ack", protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const userId = req.user._id;
    if (!notice.acknowledgements.includes(userId)) {
      notice.acknowledgements.push(userId);
      await notice.save();
    }
    res.json({ message: "Acknowledged", acknowledgements: notice.acknowledgements.length });
  } catch (err) {
    console.error("Ack notice error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete notice (author or admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (req.user.role !== "admin" && notice.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await notice.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete notice error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
