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
    // derive websocket URL from VITE_API_BASE (supports wss for https)
    const base = (import.meta.env.VITE_API_BASE || 'https://smart-health-appointment-and-dgcd.onrender.com').replace(/\/$/, '');
    const SOCKET_BASE = base.replace(/^http/, 'ws');
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
    }catch(e){ alert(e.response?.data?.message || 'Send failed'); }
  };

  const activeThread = threads.find(t=>t._id===activeId);
  const isClosed = activeThread?.status === 'Closed';
  const closeChat = async ()=>{ if(!activeId) return; try{ await api.put(`/chat/threads/${activeId}/close`); await loadThreads(); }catch{} };
  const reopenChat = async ()=>{ if(!activeId) return; try{ await api.put(`/chat/threads/${activeId}/reopen`); await loadThreads(); }catch{} };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-4">
          <div className="font-semibold mb-3">Chats</div>
          {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
            <div className="space-y-2">
              {threads.length ? threads.map(t => (
                <button key={t._id} onClick={()=>setActiveId(t._id)} className={`w-full text-left p-3 rounded-lg border ${activeId===t._id?'bg-blue-50 border-blue-200':'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  <div className="text-sm text-gray-700">Patient: <span className="font-medium">{t.patientId?.name}</span></div>
                  <div className="text-xs text-gray-500">Updated {new Date(t.updatedAt).toLocaleString()}</div>
                </button>
              )) : <div className="text-gray-600 text-sm">No chats yet.</div>}
            </div>
          )}
        </motion.div>

        <motion.div className="md:col-span-2 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg p-4 flex flex-col">
          {activeId ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">Status: <span className={`font-medium ${isClosed?'text-red-600':'text-green-700'}`}>{activeThread?.status||'Open'}</span></div>
                <div className="flex gap-2">
                  {!isClosed ? (
                    <button onClick={closeChat} className="px-3 py-1 text-sm border border-gray-300 rounded-md">End Chat</button>
                  ) : (
                    <button onClick={reopenChat} className="px-3 py-1 text-sm border border-blue-300 rounded-md">Reopen</button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map(m => (
                  <div key={m._id} className={`max-w-[80%] p-3 rounded-xl ${m.senderId===threads.find(t=>t._id===activeId)?.doctorId?._id? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
                    <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                    <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="mt-3 flex gap-2">
                <input disabled={isClosed} value={text} onChange={e=>setText(e.target.value)} placeholder={isClosed?"Chat is closed":"Type a message"} className="flex-1 border border-gray-300 rounded-md px-3 py-2 disabled:opacity-60" />
                <button disabled={isClosed} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60">Send</button>
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
