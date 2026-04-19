import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import type { BusinessListing } from '../types';
import Navbar from '../components/Navbar';
import { Shield, Check, X, Eye, Users, Briefcase, IndianRupee, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [pendingListings, setPendingListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, businesses: 0, pending: 0 });

  const fetchStats = React.useCallback(async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const bizSnap = await getDocs(collection(db, "businesses"));
    const pendingSnap = bizSnap.docs.filter(d => d.data().status === 'under_review');

    setStats({
      users: usersSnap.size,
      businesses: bizSnap.size,
      pending: pendingSnap.length
    });
    
    const q = query(
      collection(db, "businesses"), 
      where("status", "==", "under_review"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setPendingListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing)));
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, "businesses", id), { status });
      alert(`Business ${status} successfully.`);
      fetchStats();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-royal-blue text-white p-10 flex flex-col items-center md:items-start shrink-0">
        <div className="flex items-center gap-3 mb-16">
          <div className="bg-white/10 p-2 rounded-xl">
            <Shield className="text-blue-300" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight">Inves4<span className="text-blue-300 italic">Admin</span></span>
        </div>

        <nav className="w-full space-y-4">
          <button className="w-full text-left p-4 rounded-2xl bg-white/10 font-bold border border-white/10 transition-all flex items-center gap-4">
            <Briefcase size={20} />
            Review Listings
          </button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 font-bold border border-transparent transition-all flex items-center gap-4 text-blue-200">
            <Users size={20} />
            Manage Users
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10 w-full">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-blue-300 hover:text-white transition-all flex items-center gap-2">
            Back to Marketplace
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-royal-blue mb-4">Admin Control Center</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Users</p>
                <div className="text-3xl font-black text-royal-blue">{stats.users}</div>
              </div>
              <div className="p-4 bg-blue-50 text-royal-blue rounded-2xl">
                <Users size={24} />
              </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest mb-1">Pending Review</p>
                <div className="text-3xl font-black text-amber-500">{stats.pending}</div>
              </div>
              <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
                <Clock size={24} />
              </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Live Listings</p>
                <div className="text-3xl font-black text-slate-600">{stats.businesses - stats.pending}</div>
              </div>
              <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl">
                <Check size={24} />
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <h3 className="text-xl font-black text-royal-blue">Awaiting Approval</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Business Listing</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner ID</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold">Fetching listings...</td></tr>
                ) : pendingListings.length > 0 ? (
                  pendingListings.map(biz => (
                    <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-royal-blue">{biz.title}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{biz.category} | {biz.location}</div>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-400 font-mono tracking-tight">{biz.ownerId}</td>
                      <td className="px-8 py-6 font-black text-slate-600">₹{biz.price.toLocaleString('en-IN')}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <Link to={`/business/${biz.id}`} className="p-2 text-slate-400 hover:text-royal-blue hover:bg-slate-100 rounded-xl transition-all" title="View Details">
                            <Eye size={18} />
                          </Link>
                          <button 
                            onClick={() => handleStatusUpdate(biz.id, 'approved')}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all" 
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(biz.id, 'rejected')}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">No pending listings at the moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
