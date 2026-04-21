import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MoreHorizontal,
  Mail,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { getAllUsers, updateUserStatus, updateUserRole } from '../../services/firestore';
import type { UserProfile } from '../../types';
import { cn } from '../../lib/utils';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.requestAnimationFrame(() => fetchUsers());
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      await updateUserStatus(userId, nextStatus as any);
      setUsers(users.map(u => u.uid === userId ? { ...u, status: nextStatus } as UserProfile : u));
    } catch (error) {
      alert("Status update failed protocol.");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } as any : u));
    } catch (error) {
      alert("Role transition failed.");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-10">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Search Global Directory..."
            className="w-full bg-white border border-slate-50 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-royal-blue/30 shadow-sm font-bold text-royal-blue placeholder:text-slate-300 transition-all font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-white border border-slate-50 rounded-2xl p-1 flex shadow-sm">
             {['all', 'acquirer', 'seller', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    roleFilter === role ? "bg-royal-blue text-white shadow-lg" : "text-slate-400 hover:text-royal-blue"
                  )}
                >
                  {role}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-royal-blue/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFDFF] border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Principal</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Auth Tier</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Account status</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-8 bg-slate-50/20" />
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-royal-blue/[0.01] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-royal-blue/5 flex items-center justify-center text-royal-blue font-black shadow-inner border border-royal-blue/5">
                           {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-black text-royal-blue text-sm uppercase tracking-tighter leading-none mb-1">{u.name || 'Anonymous Principal'}</p>
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
                            <Mail size={10} />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                        className={cn(
                          "bg-transparent border-0 font-black text-[9px] uppercase tracking-widest outline-none cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-all",
                          u.role === 'admin' ? "text-red-700" : (u.role === 'seller' ? "text-blue-700" : "text-slate-500")
                        )}
                      >
                        <option value="acquirer">Acquirer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-6">
                      <div className={cn(
                        "flex items-center gap-2",
                        u.status === 'blocked' ? "text-red-500" : "text-green-500"
                      )}>
                        {u.status === 'blocked' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{u.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {u.subscription?.active ? (
                        <div className="flex flex-col gap-1">
                           <span className="text-royal-blue font-black text-xs">{u.subscription.planId}</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                             <Clock size={10} />
                             Active
                           </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Basic Tier</span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => handleStatusToggle(u.uid, u.status)}
                        className={cn(
                          "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          u.status === 'active' 
                            ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" 
                            : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                        )}
                      >
                        {u.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Matching Entities Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
