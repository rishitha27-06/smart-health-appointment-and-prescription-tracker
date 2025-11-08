import nodemailer from "nodemailer";
import cron from "node-cron";
import dotenv from "dotenv";
import Appointment from "../models/appointmentModel.js";

dotenv.config();

// Configure transporter
let transporter;

export const initializeEmailService = async () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();
  console.log("✅ Email service initialized successfully");
};

// Generic email sender
export const sendMail = async ({ to, subject, html }) => {
  if (!transporter) throw new Error("Email service not initialized");

  const info = await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      '"Health Portal" <no-reply@healthportal.com>',
    to,
    subject,
    html,
  });

  console.log("📧 Email sent:", info.messageId);
  return info;
};

/* -------------------------------------------------------------------------- */
/* 🟢 Appointment Confirmation                                                */
/* -------------------------------------------------------------------------- */
export const sendAppointmentConfirmation = async (appointment, user) => {
  try {
    return await sendMail({
      to: user.email,
      subject: `Appointment Confirmed — Dr. ${appointment.doctorName}`,
      html: `
        <h1>Appointment Confirmed ✅</h1>
        <p>Dear ${user.name},</p>
        <p>Your appointment with <b>Dr. ${appointment.doctorName}</b> has been confirmed.</p>
        <ul>
          <li><b>Date:</b> ${appointment.date}</li>
          <li><b>Time:</b> ${appointment.time}</li>
          <li><b>Location:</b> ${appointment.location}</li>
        </ul>
        <p>Thank you for booking through our Health Portal!</p>
      `,
    });
  } catch (err) {
    console.error("❌ Appointment confirmation email error:", err);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/* 🔵 Appointment Reminder (1 day before)                                     */
/* -------------------------------------------------------------------------- */
export const sendAppointmentReminder = async (appointment, user) => {
  try {
    return await sendMail({
      to: user.email,
      subject: `Reminder: Appointment with Dr. ${appointment.doctorName} Tomorrow`,
      html: `
        <h1>Appointment Reminder ⏰</h1>
        <p>Dear ${user.name},</p>
        <p>This is a reminder for your appointment with <b>Dr. ${appointment.doctorName}</b> scheduled for tomorrow.</p>
        <ul>
          <li><b>Date:</b> ${appointment.date}</li>
          <li><b>Time:</b> ${appointment.time}</li>
          <li><b>Location:</b> ${appointment.location}</li>
        </ul>
        <p>Please arrive 10 minutes early for check-in.</p>
      `,
    });
  } catch (err) {
    console.error("❌ Reminder email error:", err);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/* 🔴 Appointment Cancellation                                                */
/* -------------------------------------------------------------------------- */
export const sendAppointmentCancellation = async (appointment, user) => {
  try {
    return await sendMail({
      to: user.email,
      subject: `Appointment Cancelled — Dr. ${appointment.doctorName}`,
      html: `
        <h1>Appointment Cancelled ❌</h1>
        <p>Dear ${user.name},</p>
        <p>Your appointment with <b>Dr. ${appointment.doctorName}</b> on <b>${appointment.date}</b> at <b>${appointment.time}</b> has been cancelled.</p>
        <p>If this was a mistake, you can rebook anytime through your Health Portal.</p>
      `,
    });
  } catch (err) {
    console.error("❌ Cancellation email error:", err);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/* ⏰ Daily Reminder Service (9 AM)                                           */
/* -------------------------------------------------------------------------- */
export const startReminderService = () => {
  cron.schedule(
    "0 9 * * *",
    async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
          reminderSent: { $ne: true },
        })
          .populate("patientId", "name email")
          .populate("doctorId", "name");

        for (const appt of appointments) {
          const apptDate = new Date(appt.date);
          apptDate.setHours(0, 0, 0, 0);

          if (apptDate.getTime() === tomorrow.getTime()) {
            await sendAppointmentReminder(
              {
                doctorName: appt.doctorId.name,
                date: appt.date,
                time: appt.time,
                location: "Hospital/Clinic",
              },
              { name: appt.patientId.name, email: appt.patientId.email }
            );
            appt.reminderSent = true;
            await appt.save();
          }
        }

        console.log("✅ Daily reminder service executed successfully");
      } catch (err) {
        console.error("❌ Reminder service error:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
};
