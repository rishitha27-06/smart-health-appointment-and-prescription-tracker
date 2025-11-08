// src/pages/patient/Appointments.jsx
import { useState } from "react";
import { Calendar, Clock, User, MapPin, Video, Phone, Plus } from "lucide-react";

const Appointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Sarah Wilson",
      specialization: "Cardiologist",
      date: "2024-01-20",
      time: "10:00 AM",
      type: "Video Consultation",
      status: "confirmed",
      location: "Online"
    },
    {
      id: 2,
      doctor: "Dr. Mike Johnson",
      specialization: "General Physician",
      date: "2024-01-22",
      time: "2:30 PM",
      type: "Clinic Visit",
      status: "pending",
      location: "City Medical Center"
    }
  ]);

  const [showBooking, setShowBooking] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage your healthcare appointments</p>
          </div>
          <button 
            onClick={() => setShowBooking(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Book Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments List */}
          <div className="lg:col-span-2 space-y-6">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{appointment.doctor}</h3>
                    <p className="text-gray-600">{appointment.specialization}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-3" />
                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={18} className="mr-3" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    {appointment.type === 'Video Consultation' ? <Video size={18} className="mr-3" /> : <User size={18} className="mr-3" />}
                    <span>{appointment.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3" />
                    <span>{appointment.location}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="btn-primary flex-1">Join Call</button>
                  <button className="btn-secondary flex-1">Reschedule</button>
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar & Quick Stats */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-800">Today</div>
                  <div className="text-sm text-blue-600">No appointments</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-semibold text-green-800">Next Week</div>
                  <div className="text-sm text-green-600">2 appointments scheduled</div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Appointment Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmed</span>
                  <span className="font-bold text-green-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-bold text-yellow-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-blue-600">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;