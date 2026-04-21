import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  ShieldCheck,
  TrendingUp,
  Mail,
  Phone,
  Ban
} from 'lucide-react';
import { getAllUsers, updateUserStatus } from '../../services/firestore';
import type { UserProfile } from '../../types';
import { cn } from '../../lib/utils';

const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setSellers(data.filter(u => u.role === 'seller'));
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.requestAnimationFrame(() => fetchSellers());
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      await updateUserStatus(userId, nextStatus as any);
      setSellers(sellers.map(s => s.uid === userId ? { ...s, status: nextStatus } as any : s));
    } catch (error) {
      alert("Status update failed.");
    }
  };

  const filtered = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Search Registered Merchants..."
            className="w-full bg-white border border-slate-50 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-royal-blue/30 shadow-sm font-bold text-royal-blue placeholder:text-slate-300 transition-all font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="px-6 py-3 bg-royal-blue/5 rounded-2xl border border-royal-blue/10 flex items-center gap-3">
           <TrendingUp size={16} className="text-royal-blue" />
           <span className="text-[10px] font-black uppercase text-royal-blue tracking-[0.2em]">Validated Merchant Pool: {filtered.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
             <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-50 animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((s) => (
            <div key={s.uid} className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-royal-blue/5 p-10 group transition-all hover:border-royal-blue/30">
               <div className="flex justify-between items-start mb-8">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl transition-all", s.subscription?.planId === 'Diamond' ? "bg-slate-900 shadow-slate-900/30" : "bg-royal-blue shadow-royal-blue/20")}>
                     {s.name?.charAt(0) || 'U'}
                  </div>
                  {s.subscription?.active ? (
                    <div className="flex flex-col items-end">
                       <span className={cn("font-black text-[10px] uppercase tracking-widest mb-1", s.subscription.planId === 'Diamond' ? "text-slate-900" : "text-royal-blue")}>{s.subscription.planId} TIER</span>
                       <div className="flex items-center gap-1.5 text-green-500">
                          <ShieldCheck size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Active License</span>
                       </div>
                    </div>
                  ) : (
                    <span className="text-slate-300 font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">Trial Phase</span>
                  )}
               </div>

               <div className="mb-8">
                  <h4 className="text-2xl font-black text-royal-blue tracking-tighter uppercase leading-none mb-2">{s.name || 'Anonymous Seller'}</h4>
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <Mail size={12} className="text-royal-blue/30" />
                        {s.email}
                     </div>
                     {s.phone && (
                       <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <Phone size={12} className="text-royal-blue/30" />
                          {s.phone}
                       </div>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                  <div className="text-center p-4 bg-[#FDFDFF] rounded-2xl border border-slate-50">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                     <p className={cn("text-[10px] font-black uppercase tracking-widest", s.status === 'blocked' ? "text-red-500" : "text-green-500")}>
                        {s.status}
                     </p>
                  </div>
                  <div className="text-center p-4 bg-[#FDFDFF] rounded-2xl border border-slate-50">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Registry</p>
                     <p className="text-[10px] font-black text-royal-blue uppercase tracking-widest">
                        {s.createdAt ? new Date(s.createdAt.toMillis()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Pending...'}
                     </p>
                  </div>
               </div>

               <div className="mt-8">
                  <button 
                     onClick={() => handleStatusToggle(s.uid, s.status)}
                     className={cn(
                       "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                       s.status === 'active' 
                         ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100" 
                         : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-100"
                     )}
                  >
                    {s.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                    {s.status === 'active' ? 'Deactivate Principal' : 'Restore Principal'}
                  </button>
               </div>
            </div>
          ))
        ) : (
           <div className="col-span-full py-40 bg-white rounded-[60px] border border-slate-50 flex flex-col items-center justify-center">
              <Store size={48} className="text-slate-200 mb-6" />
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No Merchants in Registry</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellers;
