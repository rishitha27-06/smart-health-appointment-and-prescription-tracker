import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, Shield } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const portals = [
    { title: "Patient Portal", desc: "Book appointments and manage your health records.", icon: <User className="w-6 h-6" />, path: "/login?role=patient" },
    { title: "Doctor Portal", desc: "Manage appointments and patient records.", icon: <Stethoscope className="w-6 h-6" />, path: "/login?role=doctor" },
    { title: "Admin Portal", desc: "System management and oversight.", icon: <Shield className="w-6 h-6" />, path: "/login?role=admin" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 flex items-center">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-gray-200 text-[13px] text-teal-700 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            Smart Healthcare Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Get Better Care For <br />
            <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Your Health
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Book appointments, chat with doctors, and keep prescriptions and lab records — all in one secure place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/login?role=patient")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/patient/find-doctors")}
              className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition-all"
            >
              Find Doctors
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {portals.map((p) => (
              <button
                key={p.title}
                onClick={() => navigate(p.path)}
                className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-lg border border-gray-100 rounded-xl shadow hover:shadow-lg transition-all"
              >
                <span className="text-teal-600 bg-teal-50 p-2 rounded-lg">
                  {p.icon}
                </span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800">
                    {p.title}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {p.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative"
        >
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-teal-200/30 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-indigo-200/30 blur-3xl rounded-full"></div>
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img
              alt="Healthcare"
              src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1600&auto=format&fit=crop"
              className="w-full h-[450px] object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
