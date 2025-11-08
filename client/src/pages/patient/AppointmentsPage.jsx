import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import api from "../../api/api";
import SlotPicker from "../../components/SlotPicker";
import { AuthContext } from "../../context/AuthContext";
import { Calendar, RefreshCw, XCircle } from "lucide-react";

export default function AppointmentsPage() {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // booking state
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // reschedule state
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [docRes, apptRes] = await Promise.all([
        api.get("/doctor-profiles"),
        api.get("/appointments"),
      ]);
      const favs = JSON.parse(localStorage.getItem('favDoctors') || '[]');
      const docs = docRes.data || [];
      const sorted = [...docs].sort((a,b)=>{
        const ai = favs.includes(a.doctorId?._id) ? 0 : 1;
        const bi = favs.includes(b.doctorId?._id) ? 0 : 1;
        return ai - bi;
      });
      setDoctors(sorted);
      setList(apptRes.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const book = async (e) => {
    e.preventDefault();
    if (!doctorId || !date || !time) return;
    setSubmitting(true);
    try {
      await api.post("/appointments", { doctorId, date, time });
      setDoctorId(""); setDate(""); setTime("");
      await fetchAll();
    } catch (e) {
      alert(e.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (appt) => {
    setEditingId(appt._id);
    setEditDate(appt.date);
    setEditTime(appt.time);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingId || !editDate || !editTime) return;
    setSubmitting(true);
    try {
      await api.put(`/appointments/${editingId}`, { date: editDate, time: editTime });
      setEditingId(null); setEditDate(""); setEditTime("");
      await fetchAll();
    } catch (e) {
      alert(e.response?.data?.message || "Reschedule failed");
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      await fetchAll();
    } catch (e) {
      alert(e.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-600"/>Book an appointment</h2>
          <form onSubmit={book} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Doctor</label>
              <select value={doctorId} onChange={(e)=>setDoctorId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-3">
                <option value="">Select a doctor</option>
                {doctors.map((d)=> {
                  const favs = JSON.parse(localStorage.getItem('favDoctors') || '[]');
                  const isFav = favs.includes(d.doctorId?._id);
                  return (
                    <option key={d._id || d.doctorId?._id} value={d.doctorId?._id}>
                      {isFav ? '★ ' : ''}{d.doctorId?.name} — {d.specialization}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Date</label>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-3" />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-800 font-medium">Available Slots</label>
              <SlotPicker doctorId={doctorId} date={date} onChange={setTime} />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button disabled={submitting || !doctorId || !date || !time} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">{submitting?"Booking...":"Book"}</button>
            </div>
          </form>
        </motion.div>

        <motion.div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My appointments</h2>
            <button onClick={fetchAll} className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center"><RefreshCw className="w-4 h-4 mr-1"/>Refresh</button>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : list.length === 0 ? (
            <p className="text-gray-600">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {list.map((a)=> (
                <div key={a._id} className="flex flex-col md:flex-row md:items-center justify-between border border-gray-200 rounded-xl p-4 bg-white/80">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">With <span className="font-medium text-gray-900">{a.doctorId?.name || "Doctor"}</span></div>
                    <div className="text-sm text-gray-600">{a.date} at {a.time} · <span className="capitalize">{a.status}</span></div>
                  </div>
                  {editingId === a._id ? (
                    <form onSubmit={saveEdit} className="mt-3 md:mt-0 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                      <input type="date" value={editDate} onChange={(e)=>setEditDate(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2" />
                      <SlotPicker doctorId={a.doctorId?._id || a.doctorId} date={editDate} onChange={setEditTime} />
                      <div className="flex gap-2 justify-end">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
                        <button type="button" onClick={()=>{setEditingId(null);}} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-3 md:mt-0 flex gap-2">
                      <button onClick={()=>startEdit(a)} className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Reschedule</button>
                      <button onClick={()=>cancel(a._id)} className="px-4 py-2 bg-red-600 text-white rounded-md inline-flex items-center"><XCircle className="w-4 h-4 mr-1"/>Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
