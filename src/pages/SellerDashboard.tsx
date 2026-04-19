import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { BusinessListing } from '../types';
import Navbar from '../components/Navbar';
import { LayoutDashboard, Briefcase, MessageSquare, TrendingUp, Plus, ExternalLink, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (user) {
        const q = query(
          collection(db, "businesses"), 
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing)));
      }
      setLoading(false);
    };
    fetchListings();
  }, [user]);

  return (
    <div className="min-h-screen bg-corporate-gray">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-royal-blue mb-2">Seller Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage your listings and track buyer enquiries</p>
          </div>
          <Link 
            to="/seller/add-listing"
            className="bg-royal-blue text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-royal-blue/20 hover:scale-105 transition-all"
          >
            <Plus size={20} />
            New Listing
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-royal-blue">
                <Briefcase size={24} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Listings</span>
            </div>
            <div className="text-3xl font-black text-royal-blue">{listings.length}</div>
            <p className="text-xs text-slate-400 font-bold mt-1 tracking-tight">Active & Pending</p>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                <MessageSquare size={24} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enquiries</span>
            </div>
            <div className="text-3xl font-black text-royal-blue">0</div>
            <p className="text-xs text-slate-400 font-bold mt-1 tracking-tight">Last 30 days</p>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Views</span>
            </div>
            <div className="text-3xl font-black text-royal-blue">0</div>
            <p className="text-xs text-slate-400 font-bold mt-1 tracking-tight">Total across all</p>
          </div>
          <div className="bg-royal-blue p-8 rounded-[32px] shadow-xl shadow-royal-blue/20 text-white">
            <p className="text-[10px] font-black uppercase text-blue-300 tracking-[0.2em] mb-4">Current Plan</p>
            <div className="text-2xl font-black mb-1 capitalize">{user?.subscription?.planId || 'Basic'}</div>
            <p className="text-xs text-blue-300/80 font-bold">Expires: 12 May 2026</p>
            <Link to="/pricing" className="inline-block mt-4 text-xs font-black text-white underline underline-offset-4">Upgrade Plan</Link>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-royal-blue">Your Listings</h3>
            <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-royal-blue transition-colors">See all</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Business Listing</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold italic">Loading your listings...</td></tr>
                ) : listings.length > 0 ? (
                  listings.map(biz => (
                    <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-inner">
                            <img src={biz.images?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="font-bold text-royal-blue mb-0.5">{biz.title}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{biz.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-600">₹{biz.price.toLocaleString('en-IN')}</td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                          biz.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" :
                          biz.status === 'under_review' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-red-50 text-red-600 border-red-100"
                        )}>
                          {biz.status === 'approved' ? <CheckCircle2 size={12} /> : 
                           biz.status === 'under_review' ? <Clock size={12} /> : 
                           <AlertCircle size={12} />}
                          {biz.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <Link to={`/business/${biz.id}`} className="text-slate-400 hover:text-royal-blue transition-colors">
                            <ExternalLink size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">No listings found. Start by adding your first business.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
