import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getEnquiries } from '../services/firestore';
import type { BusinessListing, Enquiry } from '../types';
import Navbar from '../components/Navbar';
import { LayoutDashboard, Briefcase, MessageSquare, TrendingUp, Plus, ExternalLink, Clock, AlertCircle, CheckCircle2, ShieldCheck, Zap, Crown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const MerchantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    enquiries: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const qListings = query(
          collection(db, "businesses"), 
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const [listingsSnap, enquiriesData] = await Promise.all([
          getDocs(qListings),
          getEnquiries('seller')
        ]);
        
        const allListings = listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
        setListings(allListings.slice(0, 5));
        
        setStats({
          total: allListings.length,
          approved: allListings.filter(l => l.status === 'approved').length,
          pending: allListings.filter(l => l.status === 'under_review').length,
          rejected: allListings.filter(l => l.status === 'rejected').length,
          enquiries: enquiriesData.length
        });

        setEnquiries(enquiriesData.slice(0, 5));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-royal-blue/5 rounded-full text-royal-blue text-[10px] font-black uppercase tracking-widest border border-royal-blue/10 mb-4">
            Merchant Hub
          </div>
          <h1 className="text-5xl font-black text-royal-blue tracking-tighter">Enterprise Cockpit</h1>
          <p className="text-slate-400 font-bold mt-2">Overall status projection for your institutional assets.</p>
        </div>
      </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 w-fit mb-4">
                <Briefcase size={22} />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Portfolio</p>
              <div className="text-3xl font-black text-royal-blue">{stats.total}</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group border-b-4 border-b-green-500">
            <div className="relative z-10">
              <div className="p-3 bg-green-50 rounded-2xl text-green-500 w-fit mb-4">
                <CheckCircle2 size={22} />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Approved</p>
              <div className="text-3xl font-black text-royal-blue">{stats.approved}</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group border-b-4 border-b-amber-400">
            <div className="relative z-10">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 w-fit mb-4">
                <Clock size={22} />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Under Review</p>
              <div className="text-3xl font-black text-royal-blue">{stats.pending}</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="p-3 bg-royal-blue/5 rounded-2xl text-royal-blue w-fit mb-4">
                <MessageSquare size={22} />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Enquiries</p>
              <div className="text-3xl font-black text-royal-blue">{stats.enquiries}</div>
            </div>
          </div>
          
          <div className="bg-royal-blue p-8 rounded-[40px] shadow-2xl shadow-royal-blue/30 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Crown size={64} />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase text-blue-300 tracking-[0.3em] mb-4">Subscription</p>
              <div className="flex items-center gap-2 text-xl font-black mb-1">
                {user?.subscription?.planId || 'Basic Access'}
              </div>
              <p className="text-[8px] text-blue-300/60 font-black uppercase tracking-widest leading-relaxed mb-6">
                {user?.subscription?.active ? 'Strategic Tier Active' : 'Registry Awaiting Sync'}
              </p>
              <Link to="/pricing" className="block w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-all">
                Upgrade Access
              </Link>
            </div>
          </div>
        </div>

        {/* Listings Ledger */}
        <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-[#F9FAFB]/50">
            <h3 className="text-2xl font-black text-royal-blue">Your Portfolio</h3>
            <span className="px-4 py-2 bg-royal-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-royal-blue/20">
              Internal Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] text-left">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Vessel</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Valuation</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Authentication Status</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-10 py-24 text-center text-slate-300 font-black uppercase tracking-widest animate-pulse">Syncing Database...</td></tr>
                ) : listings.length > 0 ? (
                  listings.map(biz => (
                    <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-slate-100 rounded-3xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                            <img src={biz.images?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="font-black text-royal-blue text-lg mb-1">{biz.title}</div>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{biz.category}</span>
                               <span className="w-1 h-1 bg-slate-300 rounded-full" />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{biz.location.country}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 font-black text-royal-blue text-xl tracking-tighter">
                        {biz.location.country === 'UAE' ? 'AED' : 
                         biz.location.country === 'Singapore' ? 'SGD' : 
                         biz.location.country === 'Malaysia' ? 'MYR' : 'USD'} {biz.price.toLocaleString()}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm w-fit",
                              biz.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" :
                              biz.status === 'under_review' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-red-50 text-red-600 border-red-100"
                            )}>
                              {biz.status === 'approved' ? <CheckCircle2 size={12} /> : 
                               biz.status === 'under_review' ? <Clock size={12} /> : 
                               <AlertCircle size={12} />}
                              Listing: {biz.status.replace('_', ' ')}
                            </span>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm w-fit",
                              biz.planApproved ? "bg-blue-50 text-royal-blue border-blue-100" : "bg-slate-100 text-slate-400 border-slate-200"
                            )}>
                              {biz.planApproved ? <ShieldCheck size={12} /> : <Clock size={12} />}
                              Plan: {biz.planApproved ? 'Approved' : 'Awaiting Payment'}
                            </span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-center">
                          <Link to={`/business/${biz.id}`} className="p-3 bg-slate-50 text-slate-400 hover:bg-royal-blue hover:text-white rounded-2xl transition-all shadow-sm">
                            <ExternalLink size={20} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-10 py-32 text-center">
                    <div className="max-w-xs mx-auto">
                       <ShieldCheck className="mx-auto text-slate-200 mb-6" size={48} />
                       <p className="text-slate-400 font-bold mb-8">Your portfolio is currently blank. Initiate your first enterprise listing to begin.</p>
                       <Link to="/merchant/add-listing" className="text-royal-blue font-black uppercase text-[10px] tracking-widest border-b-2 border-royal-blue/20 hover:border-royal-blue transition-colors">Launch First Asset</Link>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Negotiations Ledger */}
        <div className="mt-16 bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-[#F9FAFB]/50">
            <h3 className="text-2xl font-black text-royal-blue flex items-center gap-4">
              <MessageSquare className="text-royal-blue/20" size={28} />
              Enquiry In-box
            </h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="p-10 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest">Accessing Secure Transmissions...</div>
            ) : enquiries.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {enquiries.map(enq => (
                  <Link 
                    key={enq.id} 
                    to={`/chat/${enq.id}`}
                    className="flex items-center gap-6 p-8 hover:bg-slate-50/50 transition-all group"
                  >
                    <div className="w-14 h-14 bg-royal-blue/5 text-royal-blue rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Enquiry Reference: #{enq.id.slice(0, 8)}</span>
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{enq.createdAt?.toDate().toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 font-bold truncate">"{enq.message}"</p>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:text-royal-blue group-hover:translate-x-1 transition-all" size={24} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-400 font-medium italic">Protocol Clear. No active enquiries detected.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default MerchantDashboard;
