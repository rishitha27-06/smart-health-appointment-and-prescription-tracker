// src/pages/patient/Prescriptions.jsx
import { useState, useEffect } from "react";
import { FileText, Calendar, User, Download, Eye } from "lucide-react";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      doctor: "Dr. Sarah Wilson",
      date: "2024-01-15",
      diagnosis: "Hypertension",
      medicines: [
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
        { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" }
      ],
      notes: "Monitor blood pressure weekly"
    },
    {
      id: 2,
      doctor: "Dr. Mike Johnson",
      date: "2024-01-08",
      diagnosis: "Common Cold",
      medicines: [
        { name: "Acetaminophen", dosage: "500mg", frequency: "Every 6 hours" }
      ],
      notes: "Rest and hydrate well"
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">My Prescriptions</h1>
          <p className="text-gray-600 text-lg">Access your digital prescriptions and medical records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prescriptions List */}
          <div className="lg:col-span-2 space-y-6">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{prescription.diagnosis}</h3>
                    <div className="flex items-center text-gray-600 mt-2 space-x-4">
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        <span>{prescription.doctor}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        <span>{new Date(prescription.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={20} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Download size={20} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Medications:</h4>
                  <div className="space-y-2">
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-800">{medicine.name}</span>
                          <span className="text-gray-600 ml-2">{medicine.dosage}</span>
                        </div>
                        <span className="text-sm text-gray-600">{medicine.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {prescription.notes && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">Doctor's Notes:</h4>
                    <p className="text-blue-700">{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Prescription Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Prescriptions</span>
                  <span className="font-bold text-blue-600">{prescriptions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Medications</span>
                  <span className="font-bold text-green-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-bold text-purple-600">Today</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  Request Prescription Renewal
                </button>
                <button className="w-full btn-secondary">
                  Share Medical History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;