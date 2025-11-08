import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/api";

export default function PrescriptionsPage(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get('/prescriptions');
      setList(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load prescriptions');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Prescriptions</h2>
          <button onClick={load} className="text-sm text-gray-600 hover:text-gray-800">Refresh</button>
        </div>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
          <div className="space-y-3">
            {list.length ? list.map((p)=> (
              <motion.div key={p._id} className="border border-gray-200 rounded-xl p-4 bg-white/80" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Doctor: <span className="font-medium text-gray-900">{p.doctorId?.name || 'Doctor'}</span></div>
                    <div className="text-sm text-gray-600">Patient: <span className="font-medium text-gray-900">{p.patientId?.name || 'Patient'}</span></div>
                    <div className="text-sm text-gray-600">Date: {new Date(p.createdAt || Date.now()).toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-semibold text-gray-800 mb-1">Medicines</div>
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {(p.medicines || []).map((m,idx)=> (
                      <li key={idx}><span className="font-medium">{m.name}</span> — {m.dosage} · {m.duration}</li>
                    ))}
                  </ul>
                </div>
                {p.instructions && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Instructions:</span> {p.instructions}
                  </div>
                )}
              </motion.div>
            )) : <p className="text-gray-600">No prescriptions found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
