import dotenv from "dotenv";
import { sendAppointmentConfirmation } from "./services/emailService.js"; // adjust path if needed

dotenv.config();

(async () => {
  try {
    await sendAppointmentConfirmation("bindu.rajamandri@gmail.com", {
      doctor: "Dr. Rao",
      date: "2025-11-09",
      time: "10:00 AM",
      location: "Vignan Health Clinic",
    });
    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }a
})();
