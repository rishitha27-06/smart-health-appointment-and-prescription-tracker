// server/scheduler/scheduler.js
import cron from "node-cron";
import Appointment from "../models/appointmentModel.js";
import { sendAppointmentConfirmation } from "../services/emailService.js";

cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Checking tomorrow's appointments...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  try {
    const appointments = await Appointment.find({ date: tomorrowDate })
      .populate("patientId", "email name")
      .populate("doctorId", "name");

    for (const appt of appointments) {
      await sendAppointmentConfirmation(
        {
          doctorName: appt.doctorId?.name || "Doctor",
          date: appt.date,
          time: appt.time,
          location: "Clinic",
        },
        { name: appt.patientId?.name, email: appt.patientId?.email }
      );
    }

    console.log("✅ Reminder emails sent for tomorrow’s appointments!");
  } catch (err) {
    console.error("❌ Cron job failed:", err.message);
  }
});
