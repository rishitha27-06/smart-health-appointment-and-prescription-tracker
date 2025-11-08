import { useEffect, useState } from "react";
import { Calendar, FileText, MessageSquare, PlusCircle, Search } from "lucide-react";
import api from "../../api/api";

export default function PatientDashboard() {
  const [apptCompleted, setApptCompleted] = useState(0);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      try {
        const [apptsRes, presRes, threadsRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/prescriptions'),
          api.get('/chat/threads'),
        ]);
        const appts = apptsRes.data || [];
        setApptCompleted(appts.filter(a => a.status === 'Completed').length);
        setPrescriptionsCount((presRes.data || []).length);
        setChatsCount((threadsRes.data || []).length);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load stats');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Welcome back 👋</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {error && (
            <div className="md:col-span-3 bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md">{error}</div>
          )}
          {!error && loading && (
            <div className="md:col-span-3 text-gray-600">Loading...</div>
          )}
          {!loading && !error && [
            { title: "Appointments Completed", count: apptCompleted, icon: <Calendar />, color: "text-blue-700" },
            { title: "Prescriptions", count: prescriptionsCount, icon: <FileText />, color: "text-emerald-700" },
            { title: "Chats", count: chatsCount, icon: <MessageSquare />, color: "text-violet-700" },
          ].map((item) => (
            <div
              key={item.title}
              className={`flex items-center justify-between p-6 rounded-2xl shadow-lg bg-white/85 backdrop-blur-md border border-white/60`}
            >
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-3xl font-bold mt-2">{item.count}</p>
              </div>
              <div className={`text-4xl opacity-80 ${item.color}`}>{item.icon}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/patient/appointments" className="p-6 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-between">
            <span className="text-lg font-semibold">Book Appointment</span>
            <PlusCircle size={28} className="text-blue-600" />
          </a>
          <a href="/patient/find-doctors" className="p-6 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-between">
            <span className="text-lg font-semibold">Find Doctors</span>
            <Search size={28} className="text-blue-600" />
          </a>
          <a href="/patient/prescriptions" className="p-6 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-between">
            <span className="text-lg font-semibold">View Prescriptions</span>
            <FileText size={28} className="text-blue-600" />
          </a>
          <a href="/patient/chats" className="p-6 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-between md:col-span-3">
            <span className="text-lg font-semibold">Open Chats</span>
            <MessageSquare size={28} className="text-blue-600" />
          </a>
        </div>
      </div>
    </div>
  );
}
