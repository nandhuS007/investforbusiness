import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Tag, 
  Search, 
  CheckCircle, 
  XSquare, 
  Eye,
  Filter,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllBusinessesAdmin, approveListing, rejectListing, deleteListing } from '../../services/firestore';
import type { BusinessListing } from '../../types';
import { cn } from '../../lib/utils';
import { Trash2 } from 'lucide-react';

const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('under_review');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await getAllBusinessesAdmin();
      setListings(data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.requestAnimationFrame(() => fetchListings());
  }, []);

  const handleApprove = async (id: string, ownerId: string) => {
    if (!window.confirm("Authorize this listing for public marketplace visibility?")) return;
    try {
      await approveListing(id, ownerId);
      setListings(listings.map(l => l.id === id ? { ...l, status: 'approved' } as BusinessListing : l));
    } catch (error) {
      alert("Authorization failed.");
    }
  };

  const handleReject = async (id: string, ownerId: string) => {
    if (!window.confirm("Revert this listing to rejection status for owner revision?")) return;
    try {
      await rejectListing(id, ownerId);
      setListings(listings.map(l => l.id === id ? { ...l, status: 'rejected' } as BusinessListing : l));
    } catch (error) {
      alert("Rejection protocol failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("PERMANENTLY PURGE this asset from the registry? This action is irreversible.")) return;
    try {
      await deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
    } catch (error) {
      alert("Purge operation failed.");
    }
  };

  const filtered = listings.filter(l => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesType = typeFilter === 'all' || l.category === typeFilter;
    const matchesLocation = locationFilter === 'all' || l.location.country === locationFilter;
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.ownerId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesLocation && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Search & Global Filters */}
      <div className="p-8 bg-white rounded-[32px] border border-slate-50 shadow-2xl shadow-royal-blue/5">
        <div className="flex flex-col gap-8">
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text"
                placeholder="Search Registry (Title, Description, Owner ID)..."
                className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-royal-blue/30 shadow-sm font-bold text-royal-blue placeholder:text-slate-300 transition-all font-mono text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Verification Status</label>
             <select 
               className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none font-bold text-royal-blue text-sm"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="all">All Records</option>
               <option value="under_review">Under Review</option>
               <option value="approved">Approved</option>
               <option value="rejected">Rejected</option>
             </select>
          </div>

          <div className="md:col-span-1">
             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Business Category</label>
             <select 
               className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none font-bold text-royal-blue text-sm"
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
             >
               <option value="all">All Types</option>
               <option value="Micro Business">Micro Business</option>
               <option value="Partnership Sale">Partnership Sale</option>
               <option value="Full Business">Full Business</option>
               <option value="Investment Opportunity">Investment Opportunity</option>
             </select>
          </div>

          <div className="md:col-span-1">
             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Jurisdiction</label>
             <select 
               className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none font-bold text-royal-blue text-sm"
               value={locationFilter}
               onChange={(e) => setLocationFilter(e.target.value)}
             >
               <option value="all">All Locations</option>
               <option value="UAE">UAE</option>
               <option value="Qatar">Qatar</option>
               <option value="Singapore">Singapore</option>
               <option value="Malaysia">Malaysia</option>
             </select>
          </div>

          <div className="flex items-end flex-col">
             <div className="w-full h-full bg-royal-blue/5 rounded-2xl flex items-center justify-center border border-royal-blue/10">
                <div className="text-center">
                  <p className="text-[9px] font-black text-royal-blue uppercase tracking-widest">Global Result Set</p>
                  <p className="text-xl font-black text-royal-blue leading-none">{filtered.length}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
             <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-50 animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((l) => (
            <div key={l.id} className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-royal-blue/5 overflow-hidden flex flex-col lg:flex-row group transition-all hover:shadow-royal-blue/10">
              {/* Asset Documentation Visual */}
              <div className="lg:w-80 h-64 lg:h-auto bg-slate-100 relative">
                 {l.images && l.images.length > 0 ? (
                   <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ClipboardList size={48} />
                   </div>
                 )}
                 <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl",
                      l.status === 'approved' ? "bg-green-500 text-white" : (l.status === 'under_review' ? "bg-amber-500 text-white" : "bg-red-500 text-white")
                    )}>
                      {l.status.replace('_', ' ')}
                    </div>
                    {l.planApproved && (
                      <div className="px-4 py-2 bg-royal-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <ShieldCheck size={14} />
                        Plan Verified
                      </div>
                    )}
                 </div>
              </div>

              {/* Asset Intelligence */}
              <div className="flex-1 p-10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                       <span className="text-royal-blue text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">{l.category}</span>
                       <h4 className="text-3xl font-black text-royal-blue tracking-tighter leading-none mb-2">{l.title}</h4>
                       <div className="flex items-center gap-4 text-slate-400">
                         <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest leading-none">
                           <MapPin size={12} className="text-royal-blue" />
                           {l.location.city}, {l.location.country}
                         </span>
                         <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest leading-none">
                           <Tag size={12} className="text-blue-500" />
                           Valuation: ${l.price.toLocaleString()}
                         </span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Registration Date</p>
                       <p className="font-mono text-royal-blue text-xs">
                         {l.createdAt ? new Date(l.createdAt.toMillis()).toLocaleDateString() : 'Syncing...'}
                       </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 font-bold leading-relaxed line-clamp-2 max-w-2xl mb-8">
                    {l.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-slate-50">
                   <div className="flex items-center gap-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                      <span>Owner CID: {l.ownerId?.slice(0, 10)}</span>
                      <div className="w-1 h-1 bg-slate-100 rounded-full" />
                      <span>Financial Node: Active</span>
                   </div>

                   <div className="flex items-center gap-3">
                      <Link to={`/business/${l.id}`} target="_blank" className="px-6 py-4 bg-[#F9FAFB] text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
                        <Eye size={16} />
                        Audit View
                      </Link>
                      {l.status === 'under_review' ? (
                        <>
                          <button 
                            onClick={() => handleReject(l.id, l.ownerId)}
                            className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100"
                          >
                            Reject Asset
                          </button>
                          <button 
                            onClick={() => handleApprove(l.id, l.ownerId)}
                            className="px-10 py-4 bg-royal-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-royal-blue/20 hover:scale-[1.03] transition-all flex items-center gap-2"
                          >
                            <ArrowUpRight size={16} />
                            Approve & Publish
                          </button>
                        </>
                      ) : (
                         <div className="flex items-center gap-3">
                            <div className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {l.status} Record Locked
                            </div>
                            <button 
                              onClick={() => handleDelete(l.id)}
                              className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
                              title="Purge Asset"
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white py-40 rounded-[60px] border border-slate-50 flex flex-col items-center justify-center">
             <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8">
                <ClipboardList size={40} className="text-slate-200" />
             </div>
             <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No Assets Match Filtering Parameters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminListings;
