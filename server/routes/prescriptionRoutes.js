import express from "express";
import nodemailer from "nodemailer";
import Prescription from "../models/prescriptionModel.js";
import User from "../models/userModel.js";
import { generatePrescriptionPDF } from "../utils/generatePrescriptionPDF.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ CREATE Prescription (Doctor or Admin)
 */
router.post("/", protect, authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const { doctorId, patientId, appointmentId, medicines, instructions } = req.body;

    // Basic validation
    if (!doctorId || !patientId) {
      return res.status(400).json({ message: "doctorId and patientId are required" });
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "medicines array is required and cannot be empty" });
    }

    if (!instructions) {
      return res.status(400).json({ message: "instructions are required" });
    }

    // Doctor validation: can only create prescriptions under their own ID
    if (req.user.role === "doctor" && req.user._id.toString() !== doctorId) {
      return res
        .status(403)
        .json({ message: "Doctors can only create prescriptions under their own ID" });
    }

    // Check doctor and patient existence
    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ message: "Doctor or patient not found" });
    }

    // Create prescription
    const prescription = await Prescription.create({
      doctorId,
      patientId,
      appointmentId,
      medicines,
      instructions,
    });

    // Generate a PDF file for this prescription (wait until file is written)
    let pdfPath;
    try {
      pdfPath = await generatePrescriptionPDF(prescription, doctor, patient);
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
      // Don't block creation if PDF fails — return prescription but indicate pdf failure
      return res.status(201).json({
        message: "Prescription created but failed to generate PDF",
        prescription,
        pdfError: pdfErr.message,
      });
    }

    // Email setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send PDF to patient
    try {
      await transporter.sendMail({
        from: `"Smart Health System" <${process.env.EMAIL}>`,
        to: patient.email,
        subject: `Your Prescription from Dr. ${doctor.name}`,
        text: `Hello ${patient.name},\n\nYou have a new prescription from Dr. ${doctor.name}.\nPlease find the attached PDF.\n\nStay Healthy,\nSmart Health System`,
        attachments: [
          {
            filename: `prescription_${prescription._id}.pdf`,
            path: pdfPath,
          },
        ],
      });

      return res.status(201).json({
        message: "✅ Prescription created and emailed to patient successfully!",
        prescription,
        emailSent: true,
      });
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      // Return created prescription but mark email failure
      return res.status(201).json({
        message: "Prescription created but failed to send email",
        prescription,
        emailSent: false,
        emailError: emailErr.message,
      });
    }
  } catch (error) {
    console.error("Prescription creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ GET all prescriptions (Role-based)
 */
router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "doctor") {
      query = { doctorId: req.user._id };
    } else if (req.user.role === "patient") {
      query = { patientId: req.user._id };
    }

    const prescriptions = await Prescription.find(query)
      .populate("doctorId", "name email role")
      .populate("patientId", "name email role")
      .populate("appointmentId", "date time");

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ UPDATE Prescription (Doctor/Admin)
 */
router.put("/:id", protect, authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    if (req.user.role === "doctor" && prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Doctors can only update their own prescriptions" });
    }

    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Prescription updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ DELETE Prescription (Doctor/Admin)
 */
router.delete("/:id", protect, authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    if (req.user.role === "doctor" && prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Doctors can only delete their own prescriptions" });
    }

    await prescription.deleteOne();
    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
