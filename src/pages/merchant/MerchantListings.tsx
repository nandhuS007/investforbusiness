import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import type { BusinessListing } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const MerchantListings: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'under_review' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "businesses"), 
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing)));
      } catch (error) {
        console.error("Listing retrieval failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  const handleDelete = async (id: string, status: string) => {
    if (status === 'approved') {
      alert("Active listings require administrative intervention for deletion.");
      return;
    }
    if (window.confirm("Confirm deletion of this enterprise listing? This action is irreversible.")) {
      try {
        await deleteDoc(doc(db, "businesses", id));
        setListings(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        alert("Deletion protocol failed.");
      }
    }
  };

  const filteredListings = listings.filter(l => {
    const matchesFilter = filter === 'all' || l.status === filter;
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || 
                         l.location.city.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Header Strategy */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-royal-blue tracking-tighter mb-2">Asset Portfolio</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Managing Institutional Liquidity Inventory</p>
        </div>
        <Link 
          to="/merchant/add-listing"
          className="flex items-center gap-3 bg-royal-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 shadow-xl shadow-royal-blue/30 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Inception: New Listing
        </Link>
      </div>

      {/* Control Console */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Search assets by title or region..."
            className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-royal-blue/30 transition-all font-bold text-royal-blue placeholder:text-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
          {['all', 'under_review', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                filter === f ? "bg-white text-royal-blue shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white h-96 rounded-[40px] animate-pulse border border-slate-50" />
            ))
          ) : filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-royal-blue/5 transition-all group flex flex-col h-full"
              >
                <div className="relative h-56 shrink-0">
                  <img 
                    src={listing.images[0] || 'https://via.placeholder.com/400x300'} 
                    alt={listing.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 right-6">
                     <span className={cn(
                       "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-lg flex items-center gap-2",
                       listing.status === 'approved' ? "bg-green-500 text-white border-green-400" :
                       listing.status === 'under_review' ? "bg-amber-400 text-royal-blue border-amber-300" :
                       "bg-red-500 text-white border-red-400"
                     )}>
                        {listing.status === 'approved' ? <CheckCircle2 size={12} /> : 
                         listing.status === 'under_review' ? <Clock size={12} /> : 
                         <AlertCircle size={12} />}
                        {listing.status.replace('_', ' ')}
                     </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-6 flex-1">
                    <h3 className="text-xl font-black text-royal-blue tracking-tight leading-tight mb-2 line-clamp-2">{listing.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span>{listing.category}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full" />
                       <span>{listing.location.city}, {listing.location.country}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-[8px] uppercase font-black tracking-widest mb-1">Valuation</p>
                      <p className="text-xl font-black text-royal-blue leading-none">
                        {listing.location.country === 'UAE' ? 'AED' : 'USD'} {listing.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                       <Link to={`/business/${listing.id}`} className="p-3 bg-slate-50 text-slate-400 hover:bg-royal-blue hover:text-white rounded-xl transition-all shadow-sm">
                          <ExternalLink size={18} />
                       </Link>
                       {listing.status !== 'approved' && (
                         <button 
                           onClick={() => handleDelete(listing.id, listing.status)}
                           className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                         >
                            <Trash2 size={18} />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
               <Briefcase size={64} className="text-slate-100 mb-8" />
               <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tight">No Matching Assets</h3>
               <p className="text-slate-400 font-bold mt-2">Adjust your filters or initiate a new listing registry.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MerchantListings;
