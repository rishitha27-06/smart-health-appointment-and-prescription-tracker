import express from "express";
import DoctorProfile from "../models/doctorProfileModel.js";
import User from "../models/userModel.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create or Update Doctor Profile (Doctor only)
router.post("/", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { specialization, experience, bio, location, availability, slotDurationMins } = req.body;

    // Ensure experience is a number when provided
    const expNum = typeof experience === "string" ? parseInt(experience, 10) : experience;

    const update = {
      $set: { specialization, experience: expNum, bio, location },
      $setOnInsert: { doctorId: req.user._id },
    };
    if (typeof slotDurationMins !== "undefined") {
      update.$set.slotDurationMins = Number(slotDurationMins) || 15;
    }
    if (availability) {
      update.$set.availability = availability;
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorId: req.user._id },
      update,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: "Profile saved successfully ✅", profile });
  } catch (error) {
    console.error("Doctor profile save error:", error);
    // If validation error, return 400 to the client with messages
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update Availability and Slot Duration (Doctor only, upsert profile)
router.post("/availability", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { availability, slotDurationMins } = req.body;
    const update = { $setOnInsert: { doctorId: req.user._id } };
    if (availability) {
      update.$set = { ...(update.$set || {}), availability };
    }
    if (typeof slotDurationMins !== "undefined") {
      update.$set = { ...(update.$set || {}), slotDurationMins: Number(slotDurationMins) || 15 };
    }
    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorId: req.user._id },
      update,
      { new: true, upsert: true }
    ).populate("doctorId", "name email");
    res.json({ message: "Availability saved", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add/Update Available Slots (Doctor only)
router.post("/slots", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { slots } = req.body;

    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorId: req.user._id },
      { $set: { slots } },
      { new: true }
    );

    res.status(200).json({ message: "Slots updated successfully ✅", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get Doctor Profile (Public)
router.get("/:doctorId", async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ doctorId: req.params.doctorId }).populate("doctorId", "name email");
    if (!profile) return res.status(404).json({ message: "Doctor not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get All Doctors (Public — used by patients to search)
router.get("/", async (req, res) => {
  try {
    const { specialization, symptom, q } = req.query;
    let filter = {};

    if (specialization) {
      filter.specialization = new RegExp(specialization, "i");
    }

    if (symptom) {
      // Map common symptoms to specializations
      const symptomToSpecialization = {
        'muscle pain': ['orthopedic', 'sports medicine', 'physical therapy'],
        'fever': ['internal medicine', 'infectious disease', 'general practice'],
        'headache': ['neurology', 'internal medicine', 'general practice'],
        'chest pain': ['cardiology', 'emergency medicine', 'internal medicine'],
        'stomach pain': ['gastroenterology', 'internal medicine', 'general practice'],
        'back pain': ['orthopedic', 'neurology', 'physical therapy'],
        'cough': ['pulmonology', 'internal medicine', 'general practice'],
        'joint pain': ['rheumatology', 'orthopedic', 'sports medicine'],
        'skin rash': ['dermatology', 'allergy', 'internal medicine'],
        'eye pain': ['ophthalmology', 'emergency medicine'],
        'ear pain': ['otolaryngology', 'pediatrics'],
        'tooth pain': ['dentistry', 'oral surgery'],
        'mental health': ['psychiatry', 'psychology', 'counseling'],
        'anxiety': ['psychiatry', 'psychology', 'counseling'],
        'depression': ['psychiatry', 'psychology', 'counseling'],
        'diabetes': ['endocrinology', 'internal medicine'],
        'blood pressure': ['cardiology', 'internal medicine', 'hypertension'],
        'pregnancy': ['obstetrics', 'gynecology', 'maternal fetal medicine'],
        'child health': ['pediatrics', 'family medicine'],
        'heart': ['cardiology', 'cardiovascular surgery'],
        'cancer': ['oncology', 'hematology'],
        'kidney': ['nephrology', 'urology'],
        'liver': ['hepatology', 'gastroenterology'],
        'thyroid': ['endocrinology', 'internal medicine'],
        'asthma': ['pulmonology', 'allergy', 'pediatrics'],
        'allergy': ['allergy', 'immunology', 'internal medicine'],
        'infection': ['infectious disease', 'internal medicine'],
        'wound': ['surgery', 'emergency medicine', 'plastic surgery'],
        'burn': ['burn surgery', 'emergency medicine', 'plastic surgery'],
        'fracture': ['orthopedic', 'emergency medicine'],
        'stroke': ['neurology', 'emergency medicine'],
        'heart attack': ['cardiology', 'emergency medicine']
      };

      const symptomLower = symptom.toLowerCase();
      const relatedSpecializations = symptomToSpecialization[symptomLower] || [];

      if (relatedSpecializations.length > 0) {
        filter.specialization = { $in: relatedSpecializations.map(spec => new RegExp(spec, "i")) };
      } else {
        // If no direct mapping, search in bio and specialization fields
        filter.$or = [
          { specialization: new RegExp(symptom, "i") },
          { bio: new RegExp(symptom, "i") }
        ];
      }
    }

    let profiles = await DoctorProfile.find(filter).populate("doctorId", "name email");

    // Build specialization matchers (for filtering users without profiles)
    let specMatchers = [];
    if (filter.specialization instanceof RegExp) {
      specMatchers = [filter.specialization];
    } else if (filter.specialization && filter.specialization.$in) {
      specMatchers = filter.specialization.$in;
    }

    // Optional name/email search across doctor accounts
    const userQuery = { role: "doctor" };
    if (q) userQuery.name = new RegExp(q, "i");
    let users = await User.find(userQuery).select("_id name email specialization");

    // If q provided, filter profiles by doctor name match as well
    if (q) {
      const nameRe = new RegExp(q, "i");
      profiles = profiles.filter(p => nameRe.test(p.doctorId?.name || ""));
    }

    // Include doctors without a profile yet (respecting q and specialization/symptom filters)
    const haveProfile = new Set(profiles.map(p => String(p.doctorId?._id || p.doctorId)));
    users = users.filter(u => !haveProfile.has(String(u._id)));

    if (specMatchers.length) {
      users = users.filter(u => {
        const uspec = u.specialization || "";
        return specMatchers.some(rx => rx.test(uspec));
      });
    }

    const missing = users.map(u => ({
      _id: null,
      doctorId: { _id: u._id, name: u.name, email: u.email },
      specialization: u.specialization || "",
      experience: null,
      availability: {},
      slotDurationMins: 15,
    }));

    res.json([ ...profiles, ...missing ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
