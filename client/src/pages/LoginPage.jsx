import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "patient";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password, role });
      const { token, user } = response.data;

      if (user.role !== role) {
        setError(`You are not registered as a ${role}.`);
        setLoading(false);
        return;
      }

      login({ token, user });
      navigate(`/${user.role}-dashboard`);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white/90 backdrop-blur-lg">
        
        {/* Left Section - Image */}
        <motion.div
          className="hidden md:flex items-center justify-center bg-gradient-to-br from-teal-200 to-blue-200 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://images.unsplash.com/photo-1584467735871-5f0f6f06f06e?q=80&w=1600&auto=format&fit=crop"
            alt="Healthcare"
            className="rounded-2xl shadow-lg object-cover w-5/6 h-5/6 border border-white/50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent rounded-3xl"></div>
        </motion.div>

        {/* Right Section - Form */}
        <motion.div
          className="flex flex-col justify-center p-10 md:p-16 space-y-8 bg-white/70 backdrop-blur-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 capitalize tracking-tight">
              {role} Login
            </h1>
            <p className="text-gray-500 text-base">
              Sign in to access your dashboard and manage your records
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold text-lg shadow-md hover:shadow-xl transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center text-gray-600 space-y-3 text-sm">
            <p>
              Don’t have an account?{" "}
              <Link
                to={`/register?role=${role}`}
                className="text-teal-600 font-semibold hover:text-teal-700"
              >
                Create Account
              </Link>
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-all"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
