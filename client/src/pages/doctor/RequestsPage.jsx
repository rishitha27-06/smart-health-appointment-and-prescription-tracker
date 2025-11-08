import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/api";

export default function RequestsPage(){
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [apptRes, chatRes] = await Promise.all([
        api.get('/appointments/requests'),
        api.get('/chat/requests'),
      ]);
      setList(apptRes.data || []);
      setChatList(chatRes.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load requests');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const approve = async (id) => {
    try {
      await api.put(`/appointments/approve/${id}`);
      await load();
    } catch (e) { alert(e.response?.data?.message || 'Approve failed'); }
  };

  const decline = async (id) => {
    try {
      await api.put(`/appointments/decline/${id}`);
      await load();
    } catch (e) { alert(e.response?.data?.message || 'Decline failed'); }
  };

  const approveChat = async (id) => {
    try {
      await api.put(`/chat/requests/${id}/approve`);
      await load();
      navigate('/doctor/chats');
    } catch (e) { alert(e.response?.data?.message || 'Chat approve failed'); }
  };

  const declineChat = async (id) => {
    try {
      await api.put(`/chat/requests/${id}/decline`);
      await load();
    } catch (e) { alert(e.response?.data?.message || 'Chat decline failed'); }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Appointment Requests</h2>
            <button onClick={load} className="text-sm text-gray-600 hover:text-gray-800">Refresh</button>
          </div>
          {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
            <div className="space-y-3">
              {list.length ? list.map((r)=> (
                <motion.div key={r._id} className="border border-gray-200 rounded-xl p-4 bg-white/80" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">Patient: <span className="font-medium text-gray-900">{r.patientId?.name || 'Patient'}</span></div>
                      <div className="text-sm text-gray-700">{r.date} at {r.time}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>approve(r._id)} className="px-4 py-2 bg-green-600 text-white rounded-md">Approve</button>
                      <button onClick={()=>decline(r._id)} className="px-4 py-2 bg-red-600 text-white rounded-md">Decline</button>
                    </div>
                  </div>
                </motion.div>
              )) : <p className="text-gray-600">No pending requests.</p>}
            </div>
          )}
        </div>

        <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chat Requests</h2>
            <button onClick={load} className="text-sm text-gray-600 hover:text-gray-800">Refresh</button>
          </div>
          {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
            <div className="space-y-3">
              {chatList.length ? chatList.map((r)=> (
                <motion.div key={r._id} className="border border-gray-200 rounded-xl p-4 bg-white/80" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">Patient: <span className="font-medium text-gray-900">{r.patientId?.name || 'Patient'}</span></div>
                      <div className="text-xs text-gray-500">Requested {new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>approveChat(r._id)} className="px-4 py-2 bg-green-600 text-white rounded-md">Approve</button>
                      <button onClick={()=>declineChat(r._id)} className="px-4 py-2 bg-red-600 text-white rounded-md">Decline</button>
                    </div>
                  </div>
                </motion.div>
              )) : <p className="text-gray-600">No pending chat requests.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
