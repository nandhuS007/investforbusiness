import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  ExternalLink,
  AlertCircle,
  Search,
  Gem
} from 'lucide-react';
import { getAllPlanRequests, approvePlanRequest, rejectPlanRequest } from '../../services/firestore';
import type { PlanRequest } from '../../types';
import { cn } from '../../lib/utils';

const AdminPlanRequests: React.FC = () => {
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getAllPlanRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch plan requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.requestAnimationFrame(() => fetchRequests());
  }, []);

  const handleApprove = async (req: PlanRequest) => {
    if (!window.confirm(`Initialize ${req.planName} tier for this owner?`)) return;
    try {
      await approvePlanRequest(req.id, req.assetOwnerId, req.planName);
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'approved' } as PlanRequest : r));
    } catch (error) {
      alert("Tier authorization failed.");
    }
  };

  const handleReject = async (req: PlanRequest) => {
    const notes = window.prompt("Submit rejection reasoning for seller audit:");
    if (notes === null) return;
    try {
      await rejectPlanRequest(req.id, req.assetOwnerId, notes);
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'rejected', notes } as PlanRequest : r));
    } catch (error) {
      alert("Rejection protocol failed.");
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.assetOwnerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.businessId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Search Submissions (ID, CID)..."
            className="w-full bg-white border border-slate-50 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-royal-blue/30 shadow-sm font-bold text-royal-blue placeholder:text-slate-300 transition-all font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-white border border-slate-50 p-1.5 rounded-2xl shadow-sm">
           {['pending', 'approved', 'rejected', 'all'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 filter === f ? "bg-royal-blue text-white shadow-lg" : "text-slate-400 hover:text-royal-blue"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
           [1, 2, 3].map(i => (
             <div key={i} className="h-40 bg-white rounded-3xl border border-slate-50 animate-pulse" />
           ))
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-xl shadow-royal-blue/5 group">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg",
                  req.planName === 'Diamond' ? "bg-slate-900" : (req.planName === 'Platinum' ? "bg-royal-blue" : (req.planName === 'Intermediate' ? "bg-blue-500" : "bg-indigo-500"))
                )}>
                  {req.planName === 'Diamond' ? <Gem size={28} /> : <CreditCard size={28} />}
                </div>

                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-royal-blue/5 text-royal-blue rounded-lg border border-royal-blue/5">
                        {req.planName} Tier
                      </span>
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-1.5 text-red-500">
                          <AlertCircle size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest animate-pulse">Required Action</span>
                        </div>
                      )}
                   </div>
                   <h4 className="text-xl font-black text-royal-blue tracking-tighter uppercase leading-none mb-2">Request Identification: {req.id.slice(0, 8)}</h4>
                   <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><User size={12} /> CID: {req.assetOwnerId.slice(0, 10)}</span>
                     <span className="flex items-center gap-1.5"><Clock size={12} /> {req.createdAt ? new Date(req.createdAt.toMillis()).toLocaleDateString() : 'Syncing...'}</span>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  {req.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleReject(req)}
                        className="w-full md:w-auto px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleApprove(req)}
                        className="w-full md:w-auto px-8 py-4 bg-royal-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-royal-blue/20 hover:scale-[1.02] transition-all"
                      >
                        Authorize Tier
                      </button>
                    </>
                  ) : (
                    <div className={cn(
                      "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border",
                      req.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {req.status === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {req.status}
                    </div>
                  )}
                </div>
              </div>
              
              {req.notes && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Administrative Context</p>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">{req.notes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white py-32 rounded-[40px] border border-slate-50 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Membership Queue Stabilized</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlanRequests;
