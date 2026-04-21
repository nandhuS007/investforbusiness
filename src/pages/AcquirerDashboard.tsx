import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnquiries, getFavorites } from '../services/firestore';
import type { Enquiry, BusinessListing } from '../types';
import Navbar from '../components/Navbar';
import { MessageSquare, Briefcase, ChevronRight, Clock, ShieldCheck, Heart, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const AcquirerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [favorites, setFavorites] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transmissions' | 'whitelist'>('transmissions');

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const [enqData, favData] = await Promise.all([
          getEnquiries('acquirer'),
          getFavorites()
        ]);
        setEnquiries(enqData);
        setFavorites(favData);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-royal-blue/5 rounded-full text-royal-blue text-[10px] font-black uppercase tracking-widest border border-royal-blue/10 mb-4">
              Acquirer Terminal
            </div>
            <h1 className="text-5xl font-black text-royal-blue tracking-tighter">Strategic Portfolio</h1>
            <p className="text-slate-400 font-bold mt-2">Manage your active negotiations and prioritized acquisition targets.</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
             <button 
               onClick={() => setActiveTab('transmissions')}
               className={cn(
                 "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                 activeTab === 'transmissions' ? "bg-royal-blue text-white shadow-lg shadow-royal-blue/20" : "text-slate-400 hover:text-royal-blue"
               )}
             >
                <MessageSquare size={14} />
                Transmissions
             </button>
             <button 
               onClick={() => setActiveTab('whitelist')}
               className={cn(
                 "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                 activeTab === 'whitelist' ? "bg-royal-blue text-white shadow-lg shadow-royal-blue/20" : "text-slate-400 hover:text-royal-blue"
               )}
             >
                <Heart size={14} />
                Whitelist
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 mb-8">
               {activeTab === 'transmissions' ? 'Negotiation Pipeline' : 'Prioritized Assets'}
            </h3>
            
            {loading ? (
              <div className="p-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest">Synchronizing Portfolio...</div>
            ) : activeTab === 'transmissions' ? (
              enquiries.length > 0 ? (
                enquiries.map(enq => (
                  <Link 
                    key={enq.id} 
                    to={`/chat/${enq.id}`}
                    className="block bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-royal-blue/5 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-royal-blue/5 text-royal-blue rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <MessageSquare size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <h4 className="font-black text-royal-blue text-lg truncate">Enquiry Reference: #{enq.id.slice(0, 8)}</h4>
                          <span className="text-[10px] font-black uppercase text-slate-300">{enq.createdAt?.toDate().toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm line-clamp-1 italic">"{enq.message}"</p>
                      </div>
                      <ChevronRight className="text-slate-200 group-hover:text-royal-blue group-hover:translate-x-1 transition-all" size={24} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white p-20 rounded-[48px] border border-dashed border-slate-200 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-200">
                    <MessageSquare size={40} />
                  </div>
                  <h4 className="text-xl font-black text-slate-400">No active transmissions.</h4>
                  <Link to="/" className="inline-block px-10 py-4 bg-royal-blue text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Start Negotiation</Link>
                </div>
              )
            ) : (
              favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {favorites.map(biz => (
                     <Link key={biz.id} to={`/business/${biz.id}`} className="group relative">
                        <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all h-full">
                           <div className="h-40 bg-slate-100 relative overflow-hidden">
                              <img src={biz.images?.[0] || 'https://picsum.photos/seed/biz/800/600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" referrerPolicy="no-referrer" />
                              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black text-royal-blue uppercase tracking-widest border border-white/20">
                                 {biz.location.country}
                              </div>
                           </div>
                           <div className="p-6">
                              <h5 className="font-black text-royal-blue text-sm line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">{biz.title}</h5>
                              <p className="font-black text-royal-blue text-xs tracking-tighter">
                                 {biz.location.country === 'UAE' ? 'AED' : 'USD'} {biz.price.toLocaleString()}
                              </p>
                           </div>
                        </div>
                     </Link>
                   ))}
                </div>
              ) : (
                <div className="bg-white p-20 rounded-[48px] border border-dashed border-slate-200 text-center space-y-6">
                   <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-200">
                     <Heart size={40} />
                   </div>
                   <h4 className="text-xl font-black text-slate-400">Your whitelist is currently empty.</h4>
                   <Link to="/" className="inline-block px-10 py-4 bg-royal-blue text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Explore Marketplace</Link>
                </div>
              )
            )}
          </div>

          {/* Quick Stats sidebar */}
          <div className="space-y-8">
            <div className="bg-royal-blue p-10 rounded-[40px] text-white shadow-2xl shadow-royal-blue/20">
              <h5 className="font-black uppercase tracking-widest text-[9px] text-blue-300/60 mb-8">Clearance Level</h5>
              <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                  <ShieldCheck size={32} className="text-blue-200" />
                </div>
                <div>
                  <p className="font-black text-xl leading-none">Verified Acquirer</p>
                  <p className="text-[10px] font-bold text-blue-300/80 mt-1">Full-Market Access</p>
                </div>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-200 font-bold">Negotiations</span>
                  <span className="font-black">{enquiries.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-200 font-bold">Whitelist</span>
                  <span className="font-black">{favorites.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcquirerDashboard;
