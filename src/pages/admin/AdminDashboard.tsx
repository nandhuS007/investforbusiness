import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  ClipboardList, 
  CreditCard, 
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminStats, getRecentActivities } from '../../services/firestore';
import { cn } from '../../lib/utils';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  label: string;
  icon: any;
  color: string;
  link?: string;
}> = ({ title, value, label, icon: Icon, color, link }) => (
  <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-xl shadow-royal-blue/5 group relative overflow-hidden">
    <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110", color)} />
    
    <div className="flex justify-between items-start mb-6">
      <div className={cn("p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110", color, "text-white")}>
        <Icon size={24} />
      </div>
      {link && (
        <Link to={link} className="p-2 text-slate-300 hover:text-royal-blue transition-colors">
          <ArrowRight size={20} />
        </Link>
      )}
    </div>

    <div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-royal-blue tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          getAdminStats(),
          getRecentActivities()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    window.requestAnimationFrame(() => fetchData());
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-white rounded-[32px] border border-slate-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Consolidated Users"
          value={stats?.totalUsers || 0}
          label="Registered"
          icon={Users}
          color="bg-royal-blue"
          link="/admin/users"
        />
        <StatCard 
          title="Active Sellers"
          value={stats?.totalSellers || 0}
          label="Sellers"
          icon={Store}
          color="bg-blue-500"
          link="/admin/sellers"
        />
        <StatCard 
          title="Platform Listings"
          value={stats?.totalListings || 0}
          label="Assets"
          icon={ClipboardList}
          color="bg-indigo-500"
          link="/admin/listings"
        />
        <StatCard 
          title="Pending Approvals"
          value={(stats?.pendingListings || 0) + (stats?.pendingPlans || 0)}
          label="Critical"
          icon={TrendingUp}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-royal-blue/5 p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-royal-blue tracking-tighter mb-1">Authorization Queue</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource requests requiring immediate attention</p>
            </div>
            <Link to="/admin/plan-requests" className="px-6 py-2 bg-[#F9FAFB] rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-colors">
              Full Queue
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.pendingPlans > 0 ? (
              <div className="flex items-center gap-6 p-6 bg-red-50 rounded-3xl border border-red-100">
                <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200">
                  <CreditCard size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-red-900 mb-1">Subscription Upgrade Pending</h4>
                  <p className="text-sm font-bold text-red-700/60">{stats.pendingPlans} merchants awaiting membership verification</p>
                </div>
                <Link to="/admin/plan-requests" className="px-6 py-3 bg-red-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 hover:scale-105 transition-all">
                  Process All
                </Link>
              </div>
            ) : (
              <div className="py-20 text-center">
                 <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                    <Clock size={32} className="text-slate-200" />
                 </div>
                 <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Clear Queue Status</p>
              </div>
            )}

            {stats?.pendingListings > 0 && (
              <div className="flex items-center gap-6 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                   <ClipboardList size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-blue-900 mb-1">Marketplace Review</h4>
                  <p className="text-sm font-bold text-blue-700/60">{stats.pendingListings} new business listings awaiting quality audit</p>
                </div>
                <Link to="/admin/listings" className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-105 transition-all">
                  Review
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-royal-blue/5 p-10 flex flex-col">
          <h3 className="text-2xl font-black text-royal-blue tracking-tighter mb-8">Protocol Feed</h3>
          <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="relative pl-6 border-l-2 border-slate-50 pb-6 last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-royal-blue" />
                  <p className="text-[10px] font-black uppercase text-royal-blue tracking-widest mb-1">{act.title}</p>
                  <p className="text-xs text-slate-500 font-bold mb-2">{act.message}</p>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                    {act.time ? new Date(act.time.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                 <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Recent Signals</p>
              </div>
            )}
          </div>

          <div className="mt-10 pt-10 border-t border-slate-50">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 px-2">Strategic Hub</h4>
             <div className="grid grid-cols-2 gap-3">
               <Link to="/admin/plan-requests" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-royal-blue hover:text-white transition-all group">
                  <CreditCard size={20} className="text-royal-blue group-hover:text-white mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Audits</span>
               </Link>
               <Link to="/admin/listings" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-royal-blue hover:text-white transition-all group">
                  <Briefcase size={20} className="text-royal-blue group-hover:text-white mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Assets</span>
               </Link>
             </div>
          </div>

          <div className="mt-8 p-6 bg-royal-blue/5 rounded-3xl border border-royal-blue/10">
             <div className="flex items-center gap-3 mb-3">
                <ShieldAlert size={16} className="text-royal-blue" />
                <span className="text-[10px] font-black uppercase tracking-widest text-royal-blue">System Integrity</span>
             </div>
             <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
               "Cross-node event tracking active. All transitions are indexed for governance audit."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
