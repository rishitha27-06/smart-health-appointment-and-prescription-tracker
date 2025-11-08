// src/pages/doctor/DoctorProfile.jsx
import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit, Award } from "lucide-react";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState({
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@hospital.com",
    phone: "+1 (555) 234-5678",
    specialization: "Cardiologist",
    experience: "12 years",
    education: "MD, Harvard Medical School",
    location: "City Medical Center, New York",
    consultationFee: "$150",
    availability: "Mon-Fri, 9AM-5PM"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(doctor);

  const handleSave = () => {
    setDoctor(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200&q=80"
                  alt="Profile"
                  className="w-32 h-32 rounded-full mb-4 border-4 border-blue-100 object-cover"
                />
                <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
                <p className="text-blue-600 font-semibold mb-2">{doctor.specialization}</p>
                <div className="flex items-center text-yellow-600 mb-4">
                  <Award size={16} className="mr-1" />
                  <span className="text-sm">{doctor.experience} experience</span>
                </div>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail size={16} className="mr-3" />
                    <span className="text-sm">{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-3" />
                    <span className="text-sm">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-3" />
                    <span className="text-sm">{doctor.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Professional Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-primary flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                      <input
                        type="text"
                        value={formData.consultationFee}
                        onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input
                      type="text"
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <button onClick={handleSave} className="btn-primary w-full">
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Specialization</label>
                      <p className="text-lg font-semibold text-gray-800">{doctor.specialization}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-lg font-semibold text-gray-800">{doctor.experience}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Education</label>
                      <p className="text-lg font-semibold text-gray-800">{doctor.education}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Consultation Fee</label>
                      <p className="text-lg font-semibold text-gray-800">{doctor.consultationFee}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Availability</label>
                      <p className="text-lg font-semibold text-gray-800">{doctor.availability}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Location</label>
                      <p className="text-lg font-semibold text-gray-800">{doctor.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;