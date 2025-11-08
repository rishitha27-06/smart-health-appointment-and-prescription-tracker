import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import DoctorProfile from "../models/doctorProfileModel.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { sendMail } from "../services/emailService.js";
import crypto from "crypto";

const router = express.Router();

const REQUIRE_EMAIL_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION !== "false";

const signToken = (user) => {
  const id = (user && user._id && typeof user._id.toString === 'function') ? user._id.toString() : user?.id;
  return jwt.sign({ user: { id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const genOTP = () => String(Math.floor(100000 + Math.random() * 900000)); // 6-digit

/* ================================================
   🩺 REGISTER (Single User - Patient or Doctor)
   ================================================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, age, location, specialization, experience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if ((role || "patient") === "doctor" && !specialization) {
      return res.status(400).json({ message: "Specialization is required for doctor registration" });
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "patient", // default role is patient
      age,
      location,
      specialization: (role || "patient") === "doctor" ? specialization : undefined,
      experience,
    });

    // Persist user
    await newUser.save();

    // If doctor, ensure a basic DoctorProfile exists for search
    if (newUser.role === "doctor") {
      try {
        await DoctorProfile.findOneAndUpdate(
          { doctorId: newUser._id },
          { $setOnInsert: { doctorId: newUser._id }, $set: { specialization: specialization || "" } },
          { upsert: true }
        );
      } catch {}
    }

    // If email verification is required, create OTP and send email
    if (REQUIRE_EMAIL_VERIFICATION) {
      const otp = genOTP();
      newUser.otpCode = otp;
      newUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await newUser.save();

      let emailSent = true;
      try {
        await sendMail({
          to: newUser.email,
          subject: "Verify your email — SHAPTS",
          html: `<p>Your verification code is:</p><h2 style=\"letter-spacing:3px;\">${otp}</h2><p>This code will expire in 10 minutes.</p>`,
        });
      } catch (e) {
        emailSent = false;
        console.error("OTP email send error:", e.message);
      }

      return res.status(201).json({
        message: "✅ Registered. Verify your email with the OTP sent to you.",
        verificationRequired: true,
        emailSent,
      });
    }

    // Else auto-verify and return token
    newUser.emailVerified = true;
    await newUser.save();

    const token = signToken(newUser);
    res.status(201).json({
      message: "✅ Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================================================
   📧 TEST EMAIL DELIVERY
   ================================================= */
router.post("/test-email", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: "'to' is required" });
    const info = await sendMail({
      to,
      subject: "SHAPTS test email",
      html: `<p>This is a test email from SHAPTS at ${new Date().toISOString()}</p>`,
    });
    res.json({ message: "Email queued", info: !!info });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================================================
   👩‍💻 BULK REGISTER USERS (Admin only)
   ================================================= */
router.post("/bulk-register", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = req.body.users; // expects array
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array is required" });
    }

    const createdUsers = [];

    for (const u of users) {
      const existingUser = await User.findOne({ email: u.email });
      if (existingUser) continue; // skip existing emails

      const hashedPassword = await bcrypt.hash(u.password, 10);

      const newUser = new User({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role || "patient",
        age: u.age,
        location: u.location,
      });

      await newUser.save();
      createdUsers.push({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
    }

    res.status(201).json({
      message: "✅ Bulk registration successful",
      count: createdUsers.length,
      createdUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================================================
   🔐 LOGIN User (Doctor/Patient/Admin)
   ================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Create the same user object structure as registration
    const userData = {
      id: user._id.toString(), // Ensure ID is a string
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Per requirement: allow login even if email not verified

    const token = signToken(userData);

    // Send response in same format as registration
    res.json({
      message: "✅ Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================================================
   ✉️ VERIFY OTP & RESEND OTP
   ================================================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email and code are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No OTP pending for this user" });
    }

    const isExpired = new Date(user.otpExpiresAt).getTime() < Date.now();
    if (isExpired) return res.status(400).json({ message: "OTP expired. Please resend a new code." });
    if (String(user.otpCode) !== String(code)) return res.status(400).json({ message: "Invalid code" });

    user.emailVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = signToken(user);
    return res.json({
      message: "Email verified successfully",
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = genOTP();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendMail({
        to: user.email,
        subject: "Your new SHAPTS verification code",
        html: `<p>Your new verification code is:</p><h2 style=\"letter-spacing:3px;\">${otp}</h2><p>This code will expire in 10 minutes.</p>`,
      });
    } catch (e) {
      console.error("Resend OTP email error:", e.message);
      // still return success so client doesn't block; user can try again
    }

    return res.json({ message: "A new OTP was sent if email is valid" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
