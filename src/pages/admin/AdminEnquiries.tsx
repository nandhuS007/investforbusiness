import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  ExternalLink, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Briefcase,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllEnquiriesAdmin } from '../../services/firestore';
import type { Enquiry } from '../../types';
import { cn } from '../../lib/utils';

const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await getAllEnquiriesAdmin();
      setEnquiries(data);
    } catch (error) {
      console.error("Failed to fetch enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.requestAnimationFrame(() => fetchEnquiries());
  }, []);

  const filtered = enquiries.filter(e => 
    e.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.ownerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.acquirerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.businessId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Search Transmissions..."
            className="w-full bg-white border border-slate-50 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-royal-blue/30 shadow-sm font-bold text-royal-blue placeholder:text-slate-300 transition-all font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="px-6 py-3 bg-royal-blue/5 rounded-2xl border border-royal-blue/10 flex items-center gap-3">
           <Filter size={16} className="text-royal-blue" />
           <span className="text-[10px] font-black uppercase text-royal-blue tracking-[0.2em]">Communication Nodes: {filtered.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-royal-blue/5 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
           <div>
              <h3 className="text-2xl font-black text-royal-blue tracking-tighter mb-1">Global Communication Logs</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auditing institutional acquirer & asset owner interactions</p>
           </div>
           <div className="px-5 py-2.5 bg-royal-blue/5 rounded-xl border border-royal-blue/10 flex items-center gap-2">
              <ShieldAlert size={14} className="text-royal-blue" />
              <span className="text-[10px] font-black uppercase text-royal-blue tracking-widest">Audited Session</span>
           </div>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="p-10 animate-pulse bg-slate-50/10 h-32" />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((enq) => (
              <div key={enq.id} className="p-10 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row gap-10 items-start">
                <div className="md:w-64 space-y-4">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Originator (Acquirer)</p>
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-royal-blue/5 rounded-lg border border-royal-blue/5 text-royal-blue">
                            <User size={14} />
                         </div>
                         <span className="text-xs font-black text-royal-blue truncate uppercase tracking-tighter leading-none">{enq.acquirerId.slice(0, 10)}</span>
                      </div>
                   </div>
                   <div className="flex items-center justify-center">
                      <div className="h-4 w-px bg-slate-100" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Target (Asset Owner)</p>
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
                            <User size={14} />
                         </div>
                         <span className="text-xs font-black text-blue-600 truncate uppercase tracking-tighter leading-none">{enq.ownerId.slice(0, 10)}</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-3 mb-2">
                      <Briefcase size={16} className="text-royal-blue" />
                      <span className="text-xs font-black text-royal-blue uppercase tracking-widest">Asset Reference: {enq.businessId.slice(0, 8)}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200 mx-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Clock size={12} />
                         {new Date(enq.createdAt?.toMillis()).toLocaleString()}
                      </span>
                   </div>
                   <div className="p-6 bg-[#FDFDFF] rounded-3xl border border-slate-50 italic">
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">"{enq.message}"</p>
                   </div>
                </div>

                <div className="md:w-48 text-right">
                    <Link 
                      to={`/chat/${enq.id}`}
                      className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-royal-blue hover:border-royal-blue/30 transition-all shadow-sm flex items-center gap-2 ml-auto shrink-0"
                    >
                       Intervene
                       <ArrowRight size={14} />
                    </Link>
                </div>
              </div>
            ))
          ) : (
             <div className="py-40 text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare size={32} className="text-slate-200" />
                 </div>
                 <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Communication Data Logs Availabe</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
