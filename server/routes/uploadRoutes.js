import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medical_records",
    allowed_formats: ["jpg", "png", "pdf"],
  },
});

const upload = multer({ storage });

// Upload medical record
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    res.json({
      message: "Medical record uploaded successfully!",
      fileUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export default router;
