import { useEffect, useState } from "react";
import api from "../../api/api";
import { motion } from "framer-motion";

export default function PatientsPage(){
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState({ appointments: [], prescriptions: [], records: [] });
  const [hLoading, setHLoading] = useState(false);

  const load = async ()=>{
    setLoading(true); setError("");
    try{
      const res = await api.get('/doctor/patients');
      setPatients(res.data || []);
      if (res.data?.length && !active) setActive(res.data[0].patient?._id);
    }catch(e){ setError(e.response?.data?.message || 'Failed to load patients'); }
    finally{ setLoading(false); }
  };

  const loadHistory = async (patientId)=>{
    if (!patientId) return;
    setHLoading(true);
    try{
      const res = await api.get(`/doctor/patients/${patientId}/history`);
      setHistory(res.data || { appointments: [], prescriptions: [], records: [] });
    }catch(e){ /* ignore */ }
    finally{ setHLoading(false); }
  };

  useEffect(()=>{ load(); }, []);
  useEffect(()=>{ if(active) loadHistory(active); }, [active]);

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
            <button onClick={load} className="text-sm text-gray-600 hover:text-gray-800">Refresh</button>
          </div>
          {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
            <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
              {patients.length ? patients.map((p)=> (
                <button key={p.patient?._id}
                  onClick={()=> setActive(p.patient?._id)}
                  className={`w-full text-left border rounded-xl p-3 bg-white/80 hover:bg-white ${active===p.patient?._id ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="font-medium text-gray-900">{p.patient?.name || 'Patient'}</div>
                  <div className="text-xs text-gray-500">{p.patient?.email}</div>
                  {p.lastInteraction && (
                    <div className="text-[11px] text-gray-400 mt-1">Last: {new Date(p.lastInteraction).toLocaleString()}</div>
                  )}
                </button>
              )) : <p className="text-gray-600">No patients yet.</p>}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
          {active ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Patient History</h2>
                {hLoading && <span className="text-sm text-gray-500">Loading...</span>}
              </div>

              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Appointments</h3>
                {history.appointments?.length ? (
                  <div className="space-y-2">
                    {history.appointments.map(a=> (
                      <motion.div key={`${a._id}`} className="border rounded-xl p-3 bg-white/80" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                        <div className="text-sm text-gray-700">{a.date} at {a.time} — <span className="font-medium">{a.status}</span></div>
                      </motion.div>
                    ))}
                  </div>
                ) : <p className="text-gray-600 text-sm">No appointments.</p>}
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Prescriptions</h3>
                {history.prescriptions?.length ? (
                  <div className="space-y-2">
                    {history.prescriptions.map(p=> (
                      <motion.div key={`${p._id}`} className="border rounded-xl p-3 bg-white/80" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                        <div className="text-sm text-gray-700">{new Date(p.createdAt).toLocaleString()}</div>
                        <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify({ medicines: p.medicines, instructions: p.instructions }, null, 2)}</pre>
                      </motion.div>
                    ))}
                  </div>
                ) : <p className="text-gray-600 text-sm">No prescriptions.</p>}
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Records</h3>
                {history.records?.length ? (
                  <div className="space-y-2">
                    {history.records.map(r=> (
                      <motion.a key={`${r._id}`} href={r.fileUrl} target="_blank" rel="noreferrer" className="block border rounded-xl p-3 bg-white/80 hover:bg-white" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                        <div className="text-sm text-blue-700 underline">View record</div>
                        <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                      </motion.a>
                    ))}
                  </div>
                ) : <p className="text-gray-600 text-sm">No records.</p>}
              </section>
            </div>
          ) : (
            <p className="text-gray-600">Select a patient to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
