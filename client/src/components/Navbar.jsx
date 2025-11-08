// src/components/Navbar.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Home, User, LogOut, Settings, Heart } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const displayName = user?.name || "Guest";
  const role = user?.role || "guest";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleColor = () => {
    switch (role) {
      case "patient": return "from-emerald-500 to-teal-500";
      case "doctor": return "from-blue-500 to-indigo-500";
      case "admin": return "from-pink-500 to-rose-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getDashboardPath = () => {
    switch (role) {
      case "patient": return "/patient";
      case "doctor": return "/doctor";
      case "admin": return "/admin";
      default: return "/";
    }
  };

  return (
    <motion.nav
      className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to={getDashboardPath()}>
            <motion.div
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center shadow-lg`}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent`}>
                SHAPTS
              </h1>
            </motion.div>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <motion.div
              className="flex items-center space-x-3 cursor-pointer px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setOpen(!open)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-semibold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </motion.div>

            {/* Dropdown Menu */}
            {open && (
              <motion.div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`px-4 py-3 bg-gradient-to-r ${getRoleColor()} text-white`}>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-xs opacity-90">{user?.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Home className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-gray-700">Dashboard</span>
                  </Link>

                  <Link
                    to={`${getDashboardPath()}/profile`}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <User className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-gray-700">Profile</span>
                  </Link>

                  <Link
                    to={`${getDashboardPath()}/settings`}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Settings className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-gray-700">Settings</span>
                  </Link>

                  <div className="border-t border-gray-100 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 hover:bg-red-50 transition-colors duration-200 text-red-600"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
