// server/controllers/adminController.js

import User from '../models/userModel.js';
import DoctorProfile from '../models/doctorProfileModel.js';

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    const populatedDoctors = await Promise.all(
      doctors.map(async (doc) => {
        const profile = await DoctorProfile.findOne({ doctorId: doc._id });
        return {
          ...doc._doc, 
          specialization: profile?.specialization,
          experience: profile?.experience,
        };
      })
    );
    res.json(populatedDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private/Admin
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete any user (doctor or patient)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);

    if (user.role === 'doctor') {
      await DoctorProfile.findOneAndDelete({ doctorId: userId });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};