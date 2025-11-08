import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Calendar, MapPin, Heart, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../api/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "patient";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    location: "",
    specialization: "",
    experience: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // For doctors, require specialization
      if (role === "doctor" && !form.specialization.trim()) {
        setIsLoading(false);
        setError("Specialization is required for doctor registration");
        return;
      }
  const payload = { ...form, role };
  // Use central api instance so base URL and interceptors apply
  const res = await api.post("/auth/register", payload);
      if (res.data?.verificationRequired) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(`/login?role=${role}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "patient": return "from-green-400 to-emerald-600";
      case "doctor": return "from-blue-400 to-sky-600";
      case "admin": return "from-purple-400 to-indigo-600";
      default: return "from-pink-400 via-red-400 to-yellow-400";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "patient": return <Heart className="w-8 h-8" />;
      case "doctor": return "🩺";
      case "admin": return "👨‍💼";
      default: return "👤";
    }
  };

  const fields = [
    { name: "name", label: "Full Name", icon: User, type: "text" },
    { name: "email", label: "Email Address", icon: Mail, type: "email" },
    { name: "password", label: "Password", icon: Lock, type: "password" },
    { name: "age", label: "Age", icon: Calendar, type: "number" },
    { name: "location", label: "Location", icon: MapPin, type: "text" },
  ];

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <motion.div
          className="bg-white/85 backdrop-blur-md p-10 rounded-2xl shadow-lg text-center max-w-md border border-white/60"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600">Redirecting to login page...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">

      <motion.div
        className="bg-white/85 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/60"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${getRoleColor()} text-white mb-4`}>
            {getRoleIcon()}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 capitalize">
            {role} Registration
          </h2>
          <p className="text-gray-600 mt-2">Join our healthcare community today.</p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {fields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              <div className="relative">
                <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={field.type}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  value={form[field.name]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                />
              </div>
            </motion.div>
          ))}

          {role === "doctor" && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + fields.length * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🩺</span>
                  <input
                    type="text"
                    required={role === "doctor"}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Cardiology, Orthopedics, Dermatology"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + fields.length * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⏳</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 5"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
              </motion.div>
            </>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-gradient-to-r ${getRoleColor()} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </motion.form>

        <motion.div
          className="mt-8 text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to={`/login?role=${role}`}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Sign In
            </Link>
          </p>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
