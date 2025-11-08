import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const initialEmail = qs.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await api.post("/auth/verify-otp", { email, code });
      const { token, user } = res.data;
      // Persist auth
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(`/${user.role}-dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      await api.post("/auth/resend-otp", { email });
      setInfo("A new code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        className="bg-white/85 backdrop-blur-md shadow-lg p-10 rounded-2xl w-full max-w-md border border-white/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Verify your email</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter the 6-digit code we emailed you.</p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
        )}
        {info && (
          <div className="bg-blue-50 border border-blue-300 text-blue-700 px-3 py-2 rounded-md mb-4">{info}</div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-800 font-medium">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-800 font-medium">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="^[0-9]{6}$"
              className="w-full border border-gray-300 rounded-md px-3 py-3 tracking-widest text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="______"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={handleResend} disabled={loading} className="text-sm text-gray-600 hover:text-gray-800">
            Resend code
          </button>
        </div>
      </motion.div>
    </div>
  );
}
