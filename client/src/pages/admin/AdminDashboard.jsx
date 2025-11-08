import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, FileText, Activity, BarChart3, Settings, UserCheck, UserX, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api.js"; // 1. Import your central API handler
import StatCard from "../../components/StatCard.jsx"; // 2. Import your reusable StatCard component

const AdminDashboard = () => {
  const [stats, setStats] = useState(null); // 3. Set initial state to null
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 4. Fetch all stats in parallel for speed
        // You will need to create these endpoints in your backend
        const [statsRes, activityRes] = await Promise.all([
          api.get("/admin/dashboard-stats"), 
          api.get("/admin/recent-activity?limit=3") 
        ]);

        setStats(statsRes.data);
        setActivityLog(activityRes.data);

      } catch (error) {
        console.error("Failed to fetch admin data", error);
        // Handle error (e.g., show a toast notification)
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Runs once on component mount

  // 5. Helper function to render the correct icon for recent activity
  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_doctor':
        return <UserCheck className="w-8 h-8 text-green-600 mr-4" />;
      case 'new_patient':
        return <Users className="w-8 h-8 text-blue-600 mr-4" />;
      case 'appointment_booked':
        return <Calendar className="w-8 h-8 text-purple-600 mr-4" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500 mr-4" />;
    }
  };

  // 6. Show a loading screen while data is fetching
  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // 7. Once data is loaded, define the card arrays dynamically
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      change: stats.userChangePercentage, // e.g., "+12%" (comes from API)
      changeType: "positive"
    },
    {
      title: "Active Appointments",
      value: stats.activeAppointments,
      icon: <Calendar className="w-6 h-6 text-white" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      change: stats.appointmentChangePercentage,
      changeType: "positive"
    },
    {
      title: "Total Records",
      value: stats.totalRecords,
      icon: <FileText className="w-6 h-6 text-white" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      change: stats.recordChangePercentage,
      changeType: "positive"
    },
    {
      title: "System Health",
      value: stats.systemHealth, // e.g., "Good" (comes from API)
      icon: <Activity className="w-6 h-6 text-white" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      change: "Stable",
      changeType: "neutral"
    }
  ];

  const userStats = [
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      active: stats.activeDoctors,
      icon: UserCheck,
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      active: stats.activePatients,
      icon: Users,
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 className="text-4xl font-bold mb-2" /* ... */ >
                Admin Dashboard
              </motion.h1>
              <motion.p className="text-purple-100 text-lg" /* ... */ >
                Monitor and manage the healthcare system efficiently.
              </motion.p>
            </div>
            <motion.div className="hidden md:block" /* ... */ >
              <Shield className="w-24 h-24 text-white/20" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid - Now uses StatCard component */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {statCards.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              change={stat.change}
              changeType={stat.changeType}
            />
          ))}
        </motion.div>

        {/* User Management Overview - Now uses dynamic data */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" /* ... */ >
          {userStats.map((stat, index) => (
            <motion.div key={stat.title} /* ... */ >
              {/* ... (rest of the card code) ... */}
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              {/* ... */}
              <span className="text-2xl font-bold text-green-600">{stat.active}</span>
              {/* ... */}
              <span className="text-2xl font-bold text-red-600">{stat.value - stat.active}</span>
              {/* ... (progress bar code) ... */}
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions - Now interactive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div /* ... */ >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-purple-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <motion.button
                onClick={() => navigate("/admin/manage-records")}
                /* ... (rest of props) ... */
              >
                <Users className="w-5 h-5 mr-3" />
                Manage Users
              </motion.button>
              {/* ... (other buttons) ... */}
            </div>
          </motion.div>

          {/* System Overview - This can still be semi-static */}
          <motion.div /* ... */ >
            {/* ... (system overview code) ... */}
          </motion.div>
        </div>

        {/* Recent Activity - Now dynamic */}
        <motion.div
          className="mt-8 bg-white rounded-2xl shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {activityLog.length > 0 ? (
              activityLog.map((activity) => (
                <div key={activity._id} className="flex items-center p-4 bg-gray-50 rounded-xl">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  {/* You can use a library like 'date-fns' to format this nicely */}
                  <span className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;