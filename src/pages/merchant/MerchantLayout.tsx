import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Menu, 
  X,
  Bell,
  User,
  Settings,
  ChevronRight,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Logo from '../../components/Logo';

const MerchantLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/merchant', end: true },
    { icon: Briefcase, label: 'My Portfolio', path: '/merchant/listings' },
    { icon: MessageSquare, label: 'Enquiries', path: '/merchant/enquiries' },
    { icon: ShieldCheck, label: 'Membership', path: '/merchant/membership' },
    { icon: Star, label: 'Pricing Plans', path: '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Lateral Institutional Sidebar */}
      <aside className={cn(
        "bg-royal-blue text-white transition-all duration-500 fixed lg:relative z-50 h-screen",
        isSidebarOpen ? "w-80" : "w-0 lg:w-24 overflow-hidden"
      )}>
        <div className="p-8 flex flex-col h-full">
          <div className="mb-16 flex items-center justify-between">
            <Link to="/" className={cn("transition-opacity", !isSidebarOpen && "lg:opacity-0")}>
              <Logo isWhite className="h-8" />
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-white text-royal-blue shadow-xl shadow-royal-blue/20" 
                    : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={22} className={cn("shrink-0", !isSidebarOpen && "lg:mx-auto")} />
                <span className={cn("font-black tracking-tight uppercase text-[10px]", !isSidebarOpen && "lg:hidden")}>
                  {item.label}
                </span>
                {/* Active Indicator Projection */}
                {!isSidebarOpen && (
                  <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform" />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-8 border-t border-white/10">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 text-red-300 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all"
            >
              <LogOut size={22} />
              <span className={cn("font-black text-[10px] uppercase tracking-widest", !isSidebarOpen && "lg:hidden")}>Terminal Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Primary Display Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Superior Header Registry */}
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
            >
              <Menu size={24} />
            </button>
            <div className="h-6 w-[1px] bg-slate-100 mx-2 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Principal</p>
              <p className="text-sm font-black text-royal-blue">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/pricing" className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-royal-blue px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              Institutional Matrix
            </Link>
            <Link to="/merchant/add-listing" className="hidden md:flex items-center gap-3 bg-royal-blue text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 shadow-lg shadow-royal-blue/20 transition-all active:scale-95">
              <Plus size={16} strokeWidth={3} />
              List Asset
            </Link>
            
            <div className="h-8 w-[1px] bg-slate-100 mx-2" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Network Role</p>
                <p className="text-[10px] font-black text-royal-blue uppercase tracking-widest">Enterprise Owner</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-royal-blue overflow-hidden shadow-inner">
                 {user?.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : <User size={20} />}
              </div>
            </div>
          </div>
        </header>

        {/* Content Projection Area */}
        <div className="p-8 lg:p-12 overflow-y-auto flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MerchantLayout;
