import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Trash2, 
  Calendar, 
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import type { Notification } from '../../types';
import { cn } from '../../lib/utils';

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGlobalNotifications = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch system alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.requestAnimationFrame(() => fetchGlobalNotifications());
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Purge this system alert from the registry?")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      alert("Purge failed.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'plan_update': return <ShieldAlert className="text-royal-blue" />;
      case 'listing_update': return <CheckCircle2 className="text-green-500" />;
      case 'new_enquiry': return <MessageSquare className="text-blue-500" />;
      default: return <AlertCircle className="text-slate-400" />;
    }
  };

  const filtered = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Search System Signals..."
            className="w-full bg-white border border-slate-50 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-royal-blue/30 shadow-sm font-bold text-royal-blue placeholder:text-slate-300 transition-all font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="px-6 py-3 bg-royal-blue/5 rounded-2xl border border-royal-blue/10 flex items-center gap-3">
           <Filter size={16} className="text-royal-blue" />
           <span className="text-[10px] font-black uppercase text-royal-blue tracking-[0.1em]">Signal Limit: 50 Records</span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-royal-blue/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FDFDFF] border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Signal</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Target User (CID)</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transmission Date</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-10 py-8 bg-slate-50/20" />
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((n) => (
                  <tr key={n.id} className="hover:bg-royal-blue/[0.01] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#FDFDFF] border border-slate-50 flex items-center justify-center shadow-inner">
                           {getIcon(n.type)}
                        </div>
                        <div>
                          <p className="font-black text-royal-blue text-sm tracking-tight mb-1">{n.title}</p>
                          <p className="text-xs text-slate-500 font-bold max-w-md truncate">{n.message}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-tighter">
                         {n.userId.slice(0, 12)}...
                       </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                         <Calendar size={12} className="text-royal-blue/30" />
                         {new Date(n.createdAt?.toMillis()).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(n.id)}
                        className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Purge Signal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-40 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                       <Bell size={32} className="text-slate-200" />
                    </div>
                    <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Registry Clear Status</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
