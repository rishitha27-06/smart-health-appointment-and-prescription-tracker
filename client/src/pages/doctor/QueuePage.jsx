import { useEffect, useState, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

export default function QueuePage() {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/appointments/queue", { params: { doctorId: user?.id || user?._id, date } });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user, date]);

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Queue</h2>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2" />
        </div>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
          <div className="space-y-2">
            {data?.queue?.length ? data.queue.map((q)=> (
              <div key={q.id} className="flex items-center justify-between border border-gray-200 bg-white/80 rounded-xl p-3">
                <div>
                  <div className="text-sm text-gray-700">Slot {q.time}</div>
                  <div className="text-xs text-gray-500">Position #{q.position}</div>
                </div>
                <div className="text-sm text-gray-700">ETA ~ {q.etaMinutes} min</div>
              </div>
            )) : <p className="text-gray-600">No appointments for this date.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
