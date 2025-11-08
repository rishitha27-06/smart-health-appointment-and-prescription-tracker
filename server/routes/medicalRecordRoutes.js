import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";
import MedicalRecord from "../models/medicalRecordModel.js";

const router = express.Router();

// Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload medical record (patient only)
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // check if patient already uploaded a record
    const existingRecord = await MedicalRecord.findOne({ patientId: req.user._id });
    if (existingRecord) {
      return res.status(200).json({
        message: "Record already exists. Redirecting to dashboard...",
        record: existingRecord,
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: "medical_records" },
      async (error, result) => {
        if (error) return res.status(500).json({ message: "Upload failed", error });

        const newRecord = await MedicalRecord.create({
          patientId: req.user._id,
          fileUrl: result.secure_url,
        });

        res.status(201).json({
          message: "Medical record uploaded successfully",
          record: newRecord,
        });
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get patient's record
router.get("/my-record", protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ patientId: req.user._id });

    if (!record) {
      return res.status(404).json({ message: "No medical record found" });
    }

    res.status(200).json({ record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
