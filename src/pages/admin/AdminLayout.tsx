import React, { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  CreditCard, 
  ClipboardList, 
  MessageSquare,
  ShieldAlert,
  ArrowLeft,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import Logo from '../../components/Logo';

const AdminLayout: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'User Directory' },
    { to: '/admin/sellers', icon: Store, label: 'Sellers' },
    { to: '/admin/plan-requests', icon: CreditCard, label: 'Plan Requests' },
    { to: '/admin/listings', icon: ClipboardList, label: 'Market Listings' },
    { to: '/admin/enquiries', icon: MessageSquare, label: 'Communication' },
    { to: '/admin/notifications', icon: Bell, label: 'System Alerts' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-[100] w-14 h-14 bg-royal-blue text-white rounded-full flex items-center justify-center shadow-2xl shadow-royal-blue/40"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Admin Sidebar */}
      <aside className={cn(
        "w-72 bg-royal-blue border-r border-white/10 flex flex-col fixed inset-y-0 z-50 transition-transform duration-500",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 border-b border-white/5">
          <NavLink to="/" className="flex items-center gap-2 group">
            <Logo isWhite className="h-8" />
          </NavLink>
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
            <ShieldAlert size={14} className="text-blue-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Auth Tier: System Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group",
                isActive 
                  ? "bg-white text-royal-blue shadow-xl shadow-royal-blue/20" 
                  : "text-blue-200 hover:bg-white/5 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-royal-blue" : "text-blue-400")} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-royal-blue border border-white/20 flex items-center justify-center text-white font-black overflow-hidden shadow-inner">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user.name || 'System Principal'}</p>
              <p className="text-[10px] font-bold text-blue-400/60 truncate">{user.email}</p>
            </div>
          </div>
          <NavLink 
            to="/" 
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 text-[10px] font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            Exit Command Center
          </NavLink>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-10 w-full min-h-screen">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-royal-blue tracking-tighter leading-none mb-2">Control Plane</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Real-time Transactional Governance & Monitoring</p>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Core Nodes: Active
            </span>
          </div>
        </header>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
