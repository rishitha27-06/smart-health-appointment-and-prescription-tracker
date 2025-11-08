import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, FileText, Stethoscope, CheckCircle } from "lucide-react";
import api from "../../api/api.js"; // 1. Import your central API
import { AuthContext } from "../../context/AuthContext.jsx"; // 2. Import your AuthContext

// (You should move StatCard to its own component file, see Step 3)
const StatCard = ({ title, value, icon, color, bgColor }) => (
  <motion.div
    className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);


const DoctorDashboard = () => {
  const { user } = useContext(AuthContext); // 3. Get the logged-in user
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, completedAppointments: 0, pendingPrescriptions: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 5. Create a function to fetch all data
    const fetchData = async () => {
      if (!user) return; // Wait until user is loaded

      setLoading(true);
      try {
        const uid = user.id || user._id;
        const [apptsRes, presRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/prescriptions').catch(() => ({ data: [] })),
        ]);

        const all = Array.isArray(apptsRes.data) ? apptsRes.data : [];
        const todayStr = new Date().toISOString().slice(0,10);
        const mine = all.filter(a => (a.doctorId?._id || a.doctorId) === uid || (a.doctorId?._id ? a.doctorId._id === uid : false) || (a.doctorId === uid));
        const todayList = mine.filter(a => a.date === todayStr);
        setAppointments(todayList);

        const uniquePatients = new Set(mine.map(a => a.patientId?._id || a.patientId)).size;
        const now = new Date();
        const monthCompleted = mine.filter(a => a.status === 'Completed' && a.date && new Date(a.date).getMonth() === now.getMonth() && new Date(a.date).getFullYear() === now.getFullYear()).length;
        const pendingPres = Array.isArray(presRes.data) ? presRes.data.length : 0; // No status field; show total for now

        setStats({
          totalPatients: uniquePatients,
          todayAppointments: todayList.length,
          completedAppointments: monthCompleted,
          pendingPrescriptions: pendingPres,
        });

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // 6. Re-run when the user object is available

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // 7. Use the dynamic data
  const statCards = [
    { title: "Total Patients", value: stats.totalPatients, icon: <Users className="w-6 h-6 text-white" />, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50" },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: <Calendar className="w-6 h-6 text-white" />, color: "from-green-500 to-green-600", bgColor: "bg-green-50" },
    { title: "Completed This Month", value: stats.completedAppointments, icon: <CheckCircle className="w-6 h-6 text-white" />, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50" },
    { title: "Pending Prescriptions", value: stats.pendingPrescriptions, icon: <FileText className="w-6 h-6 text-white" />, color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <motion.h1 className="text-4xl font-bold">Welcome back, {user?.name}!</motion.h1>
            <div className="flex gap-2">
              <a href="/doctor/availability" className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Edit Availability</a>
              <a href="/doctor/requests" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Requests</a>
              <a href="/doctor/prescribe" className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Write Prescription</a>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" /* ... */ >
          {statCards.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </motion.div>

        {/* Appointments List */}
        <motion.div className="bg-white rounded-2xl shadow-xl p-6" /* ... */ >
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
            <Calendar className="w-6 h-6 mr-3 text-blue-600" />
            Today's Appointments
          </h2>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <motion.div key={appt._id} /* ... */ >
                  {/* ... display appointment data ... */}
                  <p className="font-semibold text-gray-800">{appt.patientId.name}</p>
                  <p className="text-sm text-gray-600">{appt.reason}</p>
                  {/* ... etc ... */}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* ... Other dashboard sections ... */}
      </div>
    </div>
  );
};

export default DoctorDashboard;