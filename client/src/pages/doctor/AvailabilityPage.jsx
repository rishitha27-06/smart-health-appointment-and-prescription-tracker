import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function DayRow({ day, value, onChange }) {
  const [start1, setStart1] = useState(value?.[0]?.start || "09:00");
  const [end1, setEnd1] = useState(value?.[0]?.end || "12:00");
  const [start2, setStart2] = useState(value?.[1]?.start || "14:00");
  const [end2, setEnd2] = useState(value?.[1]?.end || "17:00");

  useEffect(()=>{
    const ranges = [];
    if (start1 && end1) ranges.push({ start:start1, end:end1 });
    if (start2 && end2) ranges.push({ start:start2, end:end2 });
    onChange(day, ranges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start1,end1,start2,end2]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
      <div className="font-medium text-gray-800">{day}</div>
      <input type="time" value={start1} onChange={(e)=>setStart1(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2" />
      <input type="time" value={end1} onChange={(e)=>setEnd1(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2" />
      <input type="time" value={start2} onChange={(e)=>setStart2(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2" />
      <input type="time" value={end2} onChange={(e)=>setEnd2(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2" />
    </div>
  );
}

export default function AvailabilityPage(){
  const { user } = useContext(AuthContext);
  const [slotDuration, setSlotDuration] = useState(15);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [newBlock, setNewBlock] = useState({ date: "", start: "", end: "", reason: "" });
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(()=>{
    const load = async ()=>{
      try {
        const res = await api.get(`/doctor-profiles/${user?.id || user?._id}`);
        const p = res.data || {}; 
        setSlotDuration(p.slotDurationMins || 15);
        setAvailability(p.availability || {});
        setSpecialization(p.specialization || "");
        setExperience(p.experience || "");
      } catch (e){ /* ignore if not set yet */ }
    };
    if (user) load();
  },[user]);

  const loadBlocks = async () => {
    try {
      const res = await api.get('/doctor-blocks');
      setBlocks(res.data || []);
    } catch {}
  };
  useEffect(()=>{ if (user) loadBlocks(); }, [user]);

  const onDayChange = (day, ranges) => {
    setAvailability((prev)=> ({ ...prev, [day]: ranges }));
  };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(""); setError("");
    try {
      await api.post('/doctor-profiles/availability', { availability, slotDurationMins: Number(slotDuration) });
      setMsg('Availability saved');
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(""); setError("");
    try {
      await api.post('/doctor-profiles', { specialization, experience });
      setMsg('Profile saved');
    } catch (e) {
      setError(e.response?.data?.message || 'Profile save failed');
    } finally { setLoading(false); }
  };

  const addBlock = async (e) => {
    e.preventDefault();
    if (!newBlock.date || !newBlock.start || !newBlock.end) return;
    setLoading(true); setMsg(""); setError("");
    try {
      await api.post('/doctor-blocks', newBlock);
      setNewBlock({ date: "", start: "", end: "", reason: "" });
      await loadBlocks();
      setMsg('Blocked time added');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add block');
    } finally { setLoading(false); }
  };

  const deleteBlock = async (id) => {
    try {
      await api.delete(`/doctor-blocks/${id}`);
      await loadBlocks();
    } catch {}
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile, Availability & Slot Duration</h2>
        {msg && <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-md mb-4">{msg}</div>}
        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}

        {!specialization && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-md mb-4">
            Please add your specialization to appear in patient search results.
          </div>
        )}

        {/* Profile basics */}
        <form onSubmit={saveProfile} className="space-y-4 mb-8">
          <div>
            <label className="block mb-2 text-gray-800 font-medium">Specialization</label>
            <input type="text" value={specialization} onChange={(e)=>setSpecialization(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="e.g., Cardiology, Orthopedics" />
          </div>
          <div>
            <label className="block mb-2 text-gray-800 font-medium">Experience (years)</label>
            <input type="number" min={0} value={experience} onChange={(e)=>setExperience(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="e.g., 5" />
          </div>
          <div className="flex justify-end">
            <button disabled={loading} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50">{loading? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>

        <form onSubmit={save} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-800 font-medium">Slot Duration (minutes)</label>
            <input type="number" min={5} step={5} value={slotDuration} onChange={(e)=>setSlotDuration(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2" />
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500">Provide up to two ranges per day (optional second range)</div>
            {weekdays.map((d)=> (
              <DayRow key={d} day={d} value={availability?.[d]} onChange={onDayChange} />
            ))}
          </div>

          <div className="flex justify-end">
            <button disabled={loading} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">{loading? 'Saving...' : 'Save'}</button>
          </div>
        </form>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Blocked Time (Busy / PTO)</h3>
          <form onSubmit={addBlock} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end mb-4">
            <input type="date" className="border border-gray-300 rounded-md px-3 py-2" value={newBlock.date} onChange={(e)=>setNewBlock(v=>({...v,date:e.target.value}))} />
            <input type="time" className="border border-gray-300 rounded-md px-3 py-2" value={newBlock.start} onChange={(e)=>setNewBlock(v=>({...v,start:e.target.value}))} />
            <input type="time" className="border border-gray-300 rounded-md px-3 py-2" value={newBlock.end} onChange={(e)=>setNewBlock(v=>({...v,end:e.target.value}))} />
            <input type="text" placeholder="Reason (optional)" className="border border-gray-300 rounded-md px-3 py-2" value={newBlock.reason} onChange={(e)=>setNewBlock(v=>({...v,reason:e.target.value}))} />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Add</button>
          </form>
          <div className="space-y-2">
            {blocks.length ? blocks.map(b => (
              <div key={b._id} className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-white/80">
                <div className="text-sm text-gray-700">{b.date} · {b.start}–{b.end} {b.reason?`· ${b.reason}`:''}</div>
                <button onClick={()=>deleteBlock(b._id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
            )) : <div className="text-sm text-gray-600">No blocks</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
