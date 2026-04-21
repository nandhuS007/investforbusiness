import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, writeBatch } from 'firebase/firestore';
import { 
  getAllUsers, 
  updateUserStatus, 
  createNotification 
} from '../services/firestore';
import type { BusinessListing, PlanRequest, MembershipPlan, UserProfile } from '../types';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { Check, X, Eye, Users, Briefcase, Clock, CreditCard, ShieldAlert, Ban, Unlock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [pendingListings, setPendingListings] = useState<BusinessListing[]>([]);
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'plans' | 'users'>('listings');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, listings: 0, pendingListings: 0, pendingPlans: 0 });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      const bizSnap = await getDocs(collection(db, "businesses"));
      const plansSnap = await getDocs(collection(db, "plan_requests"));

      setUsers(allUsers);
      setStats({
        users: allUsers.length,
        listings: bizSnap.size,
        pendingListings: bizSnap.docs.filter(d => d.data().status === 'under_review').length,
        pendingPlans: plansSnap.docs.filter(d => d.data().status === 'pending').length
      });
      
      const listingsQuery = query(
        collection(db, "businesses"), 
        where("status", "==", "under_review"),
        orderBy("createdAt", "desc")
      );
      const listingsSnap = await getDocs(listingsQuery);
      setPendingListings(listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing)));

      const plansQuery = query(
        collection(db, "plan_requests"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
      );
      const plansSnapReq = await getDocs(plansQuery);
      setPlanRequests(plansSnapReq.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanRequest)));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [fetchData]);

  const handleListingApproval = async (biz: BusinessListing, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, "businesses", biz.id), { status });
      
      await createNotification({
        userId: biz.ownerId,
        title: `Listing ${status === 'approved' ? 'Authenticated' : 'Review Decision'}`,
        message: `Your asset "${biz.title}" has been ${status}.`,
        type: "listing_update",
        relatedId: biz.id
      });

      alert(`Listing ${status} successfully.`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlanApproval = React.useCallback(async (request: PlanRequest, status: 'approved' | 'rejected') => {
    try {
      const batch = writeBatch(db);
      
      batch.update(doc(db, "plan_requests", request.id), { status });
      
      if (status === 'approved') {
        const now = Date.now();
        const expiryDate = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();

        batch.update(doc(db, "businesses", request.businessId), { 
          planApproved: true,
          isFeatured: request.planName === 'Platinum'
        });
        
        batch.update(doc(db, "users", request.assetOwnerId), {
          subscription: {
            planId: request.planName,
            active: true,
            expiryDate: expiryDate
          }
        });
      }

      await batch.commit();

      await createNotification({
        userId: request.assetOwnerId,
        title: `Membership ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your ${request.planName} tier request has been ${status}.`,
        type: "plan_update",
        relatedId: request.id
      });

      alert(`Plan ${status} successfully.`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [fetchData]);

  const toggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await updateUserStatus(user.uid, newStatus);
      alert(`User ${user.name} is now ${newStatus}.`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-royal-blue text-white p-10 flex flex-col shrink-0">
        <Link to="/" className="inline-block mb-12 group">
          <Logo isWhite className="h-9" />
          <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-300/60 mt-2">Core Authority</span>
        </Link>

        <nav className="w-full space-y-2">
          <button 
            onClick={() => setActiveTab('listings')}
            className={cn(
              "w-full text-left p-4 rounded-2xl font-bold transition-all flex items-center gap-4 text-sm",
              activeTab === 'listings' ? "bg-white/10 border border-white/5" : "text-blue-200 hover:bg-white/5"
            )}
          >
            <Briefcase size={18} />
            Inventory Review
            {stats.pendingListings > 0 && (
              <span className="ml-auto w-5 h-5 bg-amber-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {stats.pendingListings}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('plans')}
            className={cn(
              "w-full text-left p-4 rounded-2xl font-bold transition-all flex items-center gap-4 text-sm",
              activeTab === 'plans' ? "bg-white/10 border border-white/5" : "text-blue-200 hover:bg-white/5"
            )}
          >
            <CreditCard size={18} />
            Membership Ledger
            {stats.pendingPlans > 0 && (
              <span className="ml-auto w-5 h-5 bg-amber-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {stats.pendingPlans}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "w-full text-left p-4 rounded-2xl font-bold transition-all flex items-center gap-4 text-sm",
              activeTab === 'users' ? "bg-white/10 border border-white/5" : "text-blue-200 hover:bg-white/5"
            )}
          >
            <Users size={18} />
            User Access
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 w-full">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-blue-300/40 hover:text-white transition-all">
            Exit to Platform
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-royal-blue tracking-tight mb-2">Omni Dashboard</h1>
            <p className="text-slate-400 font-medium">Global marketplace state & coordination hub.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Users</p>
              <div className="text-xl font-black text-royal-blue">{stats.users}</div>
            </div>
            <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Active</p>
              <div className="text-xl font-black text-green-500">{stats.listings - stats.pendingListings}</div>
            </div>
          </div>
        </header>

        {activeTab === 'listings' ? (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-royal-blue flex items-center gap-3">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Pending Listings
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] text-left">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Info</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Metrics</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={3} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Synchronizing...</td></tr>
                  ) : pendingListings.length > 0 ? (
                    pendingListings.map(biz => (
                      <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-royal-blue text-lg">{biz.title}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {biz.category} • {biz.location.city}, {biz.location.country}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-royal-blue">₹{biz.price.toLocaleString()}</div>
                          <div className="text-[10px] font-bold text-slate-400">Revenue: ₹{biz.revenue?.toLocaleString() || 'N/A'}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-2">
                            <Link to={`/business/${biz.id}`} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-royal-blue hover:text-white transition-all">
                              View Assets
                            </Link>
                            <button onClick={() => handleListingApproval(biz, 'approved')} className="p-2.5 text-green-500 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100">
                              <Check size={20} />
                            </button>
                            <button onClick={() => handleListingApproval(biz, 'rejected')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                              <X size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="p-20 text-center text-slate-400 font-medium italic">Queue is clear. No listings pending review.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'plans' ? (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-royal-blue flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                Membership Invoices
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] text-left">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Principal ID</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Tier</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Accessing Ledger...</td></tr>
                  ) : planRequests.length > 0 ? (
                    planRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs text-slate-500">{req.assetOwnerId}</td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            req.planName === 'Platinum' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-royal-blue"
                          )}>
                            {req.planName}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                          {req.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handlePlanApproval(req, 'approved')}
                              className="px-6 py-2.5 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-600 transition-all active:scale-95"
                            >
                              Confirm Payment
                            </button>
                            <button 
                              onClick={() => handlePlanApproval(req, 'rejected')}
                              className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                            >
                              <ShieldAlert size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-medium italic">No new membership requests in ledger.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-royal-blue flex items-center gap-3">
                <Users size={20} />
                User Access Management
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] text-left">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Clearance</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Syncing Directory...</td></tr>
                  ) : users.length > 0 ? (
                    users.map(u => (
                      <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-royal-blue">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border",
                            u.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" :
                            u.role === 'seller' ? "bg-blue-50 text-royal-blue border-blue-100" :
                            "bg-slate-50 text-slate-600 border-slate-100"
                          )}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <span className={cn(
                               "w-1.5 h-1.5 rounded-full",
                               u.status === 'active' ? "bg-green-500" : "bg-red-500"
                             )} />
                             <span className="text-xs font-bold text-slate-600 capitalize">{u.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center">
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => toggleUserStatus(u)}
                                className={cn(
                                  "p-2.5 rounded-xl transition-all",
                                  u.status === 'active' ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"
                                )}
                              >
                                {u.status === 'active' ? <Ban size={18} /> : <Unlock size={18} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-medium italic">Directory is empty.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
