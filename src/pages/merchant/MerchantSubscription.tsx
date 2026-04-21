import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import type { PlanRequest } from '../../types';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  Zap, 
  Shield,
  CreditCard,
  History,
  Info,
  ArrowRight,
  Gem
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const MerchantSubscription: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "plan_requests"), 
          where("assetOwnerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanRequest)));
      } catch (error) {
        console.error("Subscription sync failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const activeSubscription = user?.subscription;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black text-royal-blue tracking-tighter mb-2">Membership Status</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry of Institutional Visibility Privileges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Status Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-royal-blue/5 rounded-full translate-x-32 -translate-y-32" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-6 mb-12">
                   <div className={cn(
                     "w-20 h-20 rounded-[32px] flex items-center justify-center shadow-xl",
                     activeSubscription?.planId === 'Diamond' ? "bg-royal-blue text-white shadow-royal-blue/30" :
                     activeSubscription?.planId === 'Platinum' ? "bg-amber-400 text-royal-blue shadow-amber-400/30" :
                     activeSubscription?.planId === 'Intermediate' ? "bg-blue-500 text-white" :
                     "bg-slate-800 text-white"
                   )}>
                      {activeSubscription?.planId === 'Diamond' ? <Gem size={40} /> :
                       activeSubscription?.planId === 'Platinum' ? <Crown size={40} /> : 
                       activeSubscription?.planId === 'Intermediate' ? <Zap size={40} /> : <Shield size={40} />}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Active Tier</p>
                      <h3 className="text-3xl font-black text-royal-blue">{activeSubscription?.planId || 'Basic Access'}</h3>
                   </div>
                   <div className="flex flex-col gap-3 ml-auto text-right">
                      <span className={cn(
                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border block w-fit ml-auto",
                        activeSubscription?.active ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-100 text-slate-400 border-slate-200"
                      )}>
                         {activeSubscription?.active ? 'Synchronized' : 'Inactive'}
                      </span>
                      <button 
                        onClick={() => navigate('/pricing')}
                        className="text-[10px] font-black text-royal-blue uppercase tracking-widest hover:underline flex items-center gap-2 justify-end"
                      >
                        Upgrade Institutional Access <ArrowRight size={12} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="bg-slate-50 p-6 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Expiry Date</p>
                      <p className="font-black text-royal-blue">
                        {activeSubscription?.expiryDate ? new Date(activeSubscription.expiryDate).toLocaleDateString() : 'N/A'}
                      </p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Auto-Renewal</p>
                      <p className="font-black text-royal-blue">Disabled</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
                      <p className="font-black text-royal-blue">Manual Invoice</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Plan Feature Insight */}
          <div className="bg-royal-blue p-12 rounded-[48px] text-white shadow-2xl shadow-royal-blue/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                 <CreditCard size={120} />
             </div>
             <h4 className="text-2xl font-black mb-6">Tier Influence Projection</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Network Visibility", value: activeSubscription?.planId === 'Diamond' ? "DOMINANT (100%)" : activeSubscription?.planId === 'Platinum' ? "Strategic (90%)" : activeSubscription?.planId === 'Intermediate' ? "Elevated (65%)" : "Standard (25%)" },
                  { title: "Direct Enquiries", value: "Unlimited" },
                  { title: "Marketplace Search", value: activeSubscription?.planId === 'Diamond' || activeSubscription?.planId === 'Platinum' ? "Strategic Priority" : "Standard" },
                  { title: "Admin Support", value: activeSubscription?.planId === 'Diamond' ? "24/7 Exec Support" : activeSubscription?.planId === 'Platinum' ? "Dedicated Concierge" : "Priority Ticket" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col border-l-2 border-white/20 pl-6">
                     <span className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-1">{stat.title}</span>
                     <span className="text-xl font-black">{stat.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* History Scroll */}
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
           <div className="p-10 border-b border-slate-50 bg-[#F9FAFB]/50 flex items-center justify-between">
              <h3 className="text-xl font-black text-royal-blue flex items-center gap-3">
                 <History className="text-royal-blue/20" size={24} />
                 Registry History
              </h3>
           </div>
           
           <div className="p-8 space-y-4 overflow-y-auto max-h-[600px] flex-1">
              {loading ? (
                <div className="text-center py-10 animate-pulse text-slate-300 font-bold uppercase text-[10px]">Syncing Registry...</div>
              ) : requests.length > 0 ? (
                requests.map(req => (
                  <div key={req.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-royal-blue/20 transition-all">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-royal-blue bg-royal-blue/5 px-3 py-1 rounded-lg uppercase tracking-widest">{req.planName}</span>
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                          req.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" :
                          req.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-red-50 text-red-600 border-red-100"
                        )}>
                           {req.status}
                        </span>
                     </div>
                     <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>Initiated: {req.createdAt?.toDate().toLocaleDateString()}</span>
                        <span>BID: {req.businessId?.slice(0, 6)}</span>
                     </div>
                     {req.notes && (
                       <div className="mt-4 p-3 bg-red-50/50 rounded-xl flex gap-2 text-[10px] text-red-600 font-medium">
                          <Info size={12} className="shrink-0" />
                          {req.notes}
                       </div>
                     )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-300 italic text-sm font-medium">Registry activity clear.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantSubscription;
