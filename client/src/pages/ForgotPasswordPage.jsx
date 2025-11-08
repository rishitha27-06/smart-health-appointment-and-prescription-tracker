import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      await api.post("/auth/forgot-password", { email });
      setMsg("If an account exists, a reset token was sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
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
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Forgot password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">We'll email you a reset token.</p>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}
        {msg && <div className="bg-blue-50 border border-blue-300 text-blue-700 px-3 py-2 rounded-md mb-4">{msg}</div>}

        <form onSubmit={submit} className="space-y-4">
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
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50">
            {loading ? "Sending..." : "Send reset token"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
