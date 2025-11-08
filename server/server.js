import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import path from "path";
import {
  initializeEmailService,
  startReminderService,
} from "./services/emailService.js";
import "./scheduler/scheduler.js";
import jwt from "jsonwebtoken";

// ✅ Route Imports
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import doctorProfileRoutes from "./routes/doctorProfileRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import doctorBlockRoutes from "./routes/doctorBlockRoutes.js";
// --- 1. NEW ADMIN ROUTE IMPORT ---
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import doctorPortalRoutes from "./routes/doctorPortalRoutes.js";
import patientPortalRoutes from "./routes/patientPortalRoutes.js";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fix CORS — Allow frontend from Vite (port 5173)
app.use(
  cors({
    origin: ["http://localhost:5173"], // Your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ✅ Initialize Services (Safe startup)
try {
  initializeEmailService();
  startReminderService();
} catch (err) {
  console.error("⚠️ Email/Reminder Service Error:", err.message);
}

// ✅ ROUTES
// --- 2. NEW ADMIN ROUTE USAGE ---
app.use("/api/admin", adminRoutes); // Handles all admin-specific API calls

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/records", medicalRecordRoutes);
app.use("/api/files", uploadRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/doctor-profiles", doctorProfileRoutes);
app.use("/api/doctor-blocks", doctorBlockRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/doctor", doctorPortalRoutes);
app.use("/api/patient", patientPortalRoutes);

// ✅ Root Endpoint (For testing)
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Smart Healthcare Backend Running Successfully!",
    status: "OK",
    time: new Date().toISOString(),
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Socket.io Setup
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

// ✅ Attach io to Express app
app.set("io", io);

io.on("connection", (socket) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded?.user?.id || decoded?.id;
      if (userId) {
        socket.join(`user:${userId}`);
      }
    }
  } catch {}

  console.log("🟢 Socket connected:", socket.id);
  socket.on("join:thread", (threadId) => {
    if (threadId) socket.join(`thread:${threadId}`);
  });
  socket.on("leave:thread", (threadId) => {
    if (threadId) socket.leave(`thread:${threadId}`);
  });
  socket.on("disconnect", () => console.log("🔴 Socket disconnected:", socket.id));
});

// ✅ Start Server
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);