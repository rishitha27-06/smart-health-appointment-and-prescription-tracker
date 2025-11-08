// src/pages/patient/PatientProfile.jsx
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";

const PatientProfile = () => {
  const [patient, setPatient] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    age: 32,
    location: "New York, USA",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Peanuts"],
    emergencyContact: "+1 (555) 987-6543"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(patient);

  useEffect(() => {
    // Fetch patient data from API
    const fetchPatientData = async () => {
      // const res = await api.get('/patient/profile');
      // setPatient(res.data);
    };
    fetchPatientData();
  }, []);

  const handleSave = () => {
    setPatient(formData);
    setIsEditing(false);
    // API call to update patient data
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
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0D8ABC&color=fff&size=128`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mb-4 border-4 border-blue-100"
                />
                <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
                <p className="text-gray-600 mb-4">Patient</p>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail size={16} className="mr-3" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-3" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-3" />
                    <span className="text-sm">{patient.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                      <label className="block text-sm font-medium text-gray-600">Age</label>
                      <p className="text-lg font-semibold text-gray-800">{patient.age} years</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Blood Group</label>
                      <p className="text-lg font-semibold text-gray-800">{patient.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Allergies</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
                      <p className="text-lg font-semibold text-gray-800">{patient.emergencyContact}</p>
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

export default PatientProfile;