import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      await api.post("/auth/reset-password", { email, token, newPassword });
      setMsg("Password reset successful. You can log in now.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div className="bg-white/85 backdrop-blur-md shadow-lg p-10 rounded-2xl w-full max-w-md border border-white/60" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Reset password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Paste the token we emailed you.</p>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}
        {msg && <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-md mb-4">{msg}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-800 font-medium">Email</label>
            <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 text-gray-800 font-medium">Reset Token</label>
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" rows={3} value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 text-gray-800 font-medium">New Password</label>
            <input type="password" className="w-full border border-gray-300 rounded-md px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50">{loading ? "Resetting..." : "Reset Password"}</button>
        </form>
      </motion.div>
    </div>
  );
}
