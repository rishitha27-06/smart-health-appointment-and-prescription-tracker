import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Generate a PDF file and return a promise that resolves with the file path
export const generatePrescriptionPDF = (prescription, doctor, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const dir = path.resolve(process.cwd(), "prescriptions");
      const filePath = path.join(dir, `prescription_${prescription._id}.pdf`);

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const writeStream = fs.createWriteStream(filePath);
      writeStream.on("error", (err) => reject(err));
      writeStream.on("finish", () => resolve(filePath));

      doc.pipe(writeStream);

      doc.fontSize(20).text("Smart Health - Prescription", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Doctor: Dr. ${doctor.name} (${doctor.email})`);
      doc.text(`Patient: ${patient.name} (${patient.email})`);
      doc.text(`Date: ${new Date(prescription.date).toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(14).text("Medicines:");
      const meds = Array.isArray(prescription.medicines) ? prescription.medicines : [];
      if (meds.length === 0) {
        doc.text("No medicines listed.");
      } else {
        meds.forEach((m, i) => {
          const name = m.name || "(no name)";
          const dosage = m.dosage || "(no dosage)";
          const duration = m.duration || "(no duration)";
          doc.text(`${i + 1}. ${name} - ${dosage} for ${duration}`);
        });
      }

      doc.moveDown();
      doc.text(`Instructions: ${prescription.instructions || "(none)"}`);
      doc.moveDown(2);
      doc.text("Signature: ___________________________", { align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
