import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/api";
import { io } from "socket.io-client";

export default function ChatsPage(){
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const prevThreadRef = useRef(null);

  const loadThreads = async () => {
    try{
      const res = await api.get('/chat/threads');
      const list = res.data || [];
      setThreads(list);
      if (!activeId && list.length){ setActiveId(list[0]._id); }
    }catch(e){ setError(e.response?.data?.message || 'Failed to load threads'); }
    finally{ setLoading(false); }
  };

  const loadMessages = async (id) => {
    if (!id) return;
    try{
      const res = await api.get(`/chat/threads/${id}/messages`);
      setMessages(res.data || []);
    }catch(e){ /* ignore */ }
  };

  useEffect(()=>{ loadThreads(); }, []);
  useEffect(()=>{ if(activeId){ loadMessages(activeId); } }, [activeId]);
  // socket.io realtime
  useEffect(()=>{
    const token = localStorage.getItem('token');
    const SOCKET_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5001');
    const s = io(SOCKET_BASE, { auth: { token } });
    socketRef.current = s;
    s.on('message:new', (payload)=>{
      if (payload?.threadId === activeId) {
        loadMessages(activeId);
      }
      loadThreads();
    });
    s.on('thread:update', ()=>{ loadThreads(); });
    return ()=> { try { s.disconnect(); } catch {} };
  }, [activeId]);

  // handle join/leave thread rooms when selection changes
  useEffect(()=>{
    const s = socketRef.current; if(!s) return;
    if (prevThreadRef.current && prevThreadRef.current !== activeId) {
      s.emit('leave:thread', prevThreadRef.current);
    }
    if (activeId) {
      s.emit('join:thread', activeId);
      prevThreadRef.current = activeId;
    }
  }, [activeId]);

  const send = async (e) => {
    e.preventDefault(); if(!text.trim() || !activeId) return;
    const payload = { text };
    setText("");
    try{
      await api.post(`/chat/threads/${activeId}/messages`, payload);
      await loadMessages(activeId);
      await loadThreads();
    }catch(e){ /* ignore */ }
  };

  const closeChat = async ()=>{
    if (!activeId) return;
    try { await api.put(`/chat/threads/${activeId}/close`); await loadThreads(); await loadMessages(activeId); } catch {}
  };
  const reopenChat = async ()=>{
    if (!activeId) return;
    try { await api.put(`/chat/threads/${activeId}/reopen`); await loadThreads(); await loadMessages(activeId); } catch {}
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-4">
          <div className="font-semibold mb-3">Chats</div>
          {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
            <div className="space-y-2">
              {threads.length ? threads.map(t => (
                <button key={t._id} onClick={()=>setActiveId(t._id)} className={`w-full text-left p-3 rounded-lg border ${activeId===t._id?'bg-blue-50 border-blue-200':'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  <div className="text-sm text-gray-700">Doctor: <span className="font-medium">{t.doctorId?.name}</span></div>
                  <div className="text-xs text-gray-500">Updated {new Date(t.updatedAt).toLocaleString()}</div>
                </button>
              )) : <div className="text-gray-600 text-sm">No chats yet. Request a chat from Find Doctors.</div>}
            </div>
          )}
        </motion.div>

        <motion.div className="md:col-span-2 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-4 flex flex-col">
          {activeId ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map(m => (
                  <div key={m._id} className={`max-w-[80%] p-3 rounded-xl ${m.senderId===threads.find(t=>t._id===activeId)?.patientId?._id? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
                    <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                    <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="mt-3 flex gap-2">
                <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 border border-gray-300 rounded-md px-3 py-2" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Send</button>
              </form>
            </>
          ) : (
            <div className="text-gray-600">Select a chat</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
