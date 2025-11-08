import { useState, useContext } from "react";
import { motion } from "framer-motion";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

export default function DoctorPrescribePage(){
  const { user } = useContext(AuthContext);
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "" }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const addMed = () => setMedicines((prev)=> [...prev, { name:"", dosage:"", duration:"" }]);
  const rmMed = (i) => setMedicines((prev)=> prev.filter((_,idx)=> idx!==i));
  const setMed = (i, key, val) => setMedicines((prev)=> prev.map((m,idx)=> idx===i? { ...m, [key]: val } : m));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(""); setError("");
    try {
      const body = {
        doctorId: user?.id || user?._id,
        patientId,
        appointmentId: appointmentId || undefined,
        medicines: medicines.filter(m=>m.name?.trim()),
        instructions,
      };
      const res = await api.post("/prescriptions", body);
      setMsg(res.data?.message || "Prescription created");
      setPatientId(""); setAppointmentId(""); setInstructions(""); setMedicines([{ name:"", dosage:"", duration:"" }]);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create prescription");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Write Prescription</h2>
        {msg && <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-md mb-4">{msg}</div>}
        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Patient ID</label>
              <input className="w-full border border-gray-300 rounded-md px-3 py-3" value={patientId} onChange={(e)=>setPatientId(e.target.value)} placeholder="Paste patient user _id" required />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Appointment ID (optional)</label>
              <input className="w-full border border-gray-300 rounded-md px-3 py-3" value={appointmentId} onChange={(e)=>setAppointmentId(e.target.value)} placeholder="Link to appointment if any" />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-800 font-medium">Medicines</label>
            <div className="space-y-3">
              {medicines.map((m, i)=> (
                <motion.div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                  <input placeholder="Name" className="border border-gray-300 rounded-md px-3 py-2 md:col-span-2" value={m.name} onChange={(e)=>setMed(i,'name',e.target.value)} />
                  <input placeholder="Dosage (e.g., 500mg, 1-0-1)" className="border border-gray-300 rounded-md px-3 py-2" value={m.dosage} onChange={(e)=>setMed(i,'dosage',e.target.value)} />
                  <div className="flex gap-2">
                    <input placeholder="Duration (e.g., 5 days)" className="border border-gray-300 rounded-md px-3 py-2 flex-1" value={m.duration} onChange={(e)=>setMed(i,'duration',e.target.value)} />
                    <button type="button" onClick={()=>rmMed(i)} className="px-3 py-2 bg-gray-200 rounded-md">Remove</button>
                  </div>
                </motion.div>
              ))}
              <button type="button" onClick={addMed} className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Add medicine</button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-800 font-medium">Instructions</label>
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-3" rows={4} value={instructions} onChange={(e)=>setInstructions(e.target.value)} placeholder="General advice, usage notes, next visit..." required />
          </div>

          <div className="flex justify-end">
            <button disabled={loading} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">{loading? 'Saving...' : 'Create Prescription'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
