import React, { useState, useEffect } from 'react';
import { getEnquiries } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import type { Enquiry } from '../../types';
import { 
  MessageSquare, 
  ChevronRight, 
  Filter, 
  Search, 
  Clock, 
  User,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const MerchantEnquiries: React.FC = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEnquiries = async () => {
      const data = await getEnquiries('seller');
      setEnquiries(data);
      setLoading(false);
    };
    fetchEnquiries();
  }, [user]);

  const filteredEnquiries = enquiries.filter(e => 
    e.message.toLowerCase().includes(search.toLowerCase()) || 
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-royal-blue tracking-tighter mb-2">Transmission Registry</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Secure Marketplace Negotiation Hub</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Search enquiries by reference or content..."
            className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-royal-blue/30 transition-all font-bold text-royal-blue placeholder:text-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button className="flex items-center gap-3 px-8 py-4 bg-slate-50 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
           <Filter size={18} />
           All Channels
        </button>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
         {loading ? (
           <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-royal-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">Syncing Secure Transmissions...</p>
           </div>
         ) : filteredEnquiries.length > 0 ? (
           <div className="divide-y divide-slate-50">
              {filteredEnquiries.map((enq) => (
                <Link 
                  key={enq.id}
                  to={`/chat/${enq.id}`}
                  className="flex flex-col md:flex-row items-start md:items-center gap-8 p-10 hover:bg-slate-50/50 transition-all group border-l-4 border-transparent hover:border-royal-blue"
                >
                  <div className="w-20 h-20 rounded-[28px] bg-royal-blue/5 text-royal-blue flex flex-col items-center justify-center shrink-0 group-hover:bg-royal-blue group-hover:text-white transition-all shadow-sm">
                     <MessageSquare size={28} />
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg font-black text-[9px] uppercase tracking-widest">Channel: #{enq.id.slice(0, 8)}</span>
                        <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                           <Clock size={12} />
                           {enq.createdAt?.toDate().toLocaleString()}
                        </div>
                     </div>
                     <h3 className="text-xl font-black text-royal-blue mb-2 tracking-tight group-hover:text-blue-700 transition-colors">Strategic Interest Transmission</h3>
                     <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed italic">"{enq.message}"</p>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                     <div className="h-12 w-[1px] bg-slate-50 hidden md:block" />
                     <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                           Active Channel <ArrowRight size={12} strokeWidth={3} />
                        </span>
                     </div>
                     <ChevronRight className="text-slate-200 group-hover:text-royal-blue group-hover:translate-x-2 transition-all ml-4" size={28} />
                  </div>
                </Link>
              ))}
           </div>
         ) : (
           <div className="p-32 text-center flex flex-col items-center">
              <Inbox size={64} className="text-slate-100 mb-8" />
              <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tight">No Active Transmissions</h3>
              <p className="text-slate-400 font-bold mt-2">Your enquiry registry is currently clear.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default MerchantEnquiries;
