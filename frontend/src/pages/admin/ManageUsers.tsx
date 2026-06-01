import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Shield, ShieldAlert, Trash2, Users, AlertTriangle, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    if (userId === currentUser?._id) {
      alert("You cannot change your own role.");
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Error updating user role');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminAPI.deleteUser(deleteId);
      setDeleteId(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Error deleting user');
    }
  };

  return (
    <div className="pb-12 space-y-8 relative text-white min-h-[80vh]">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111113]/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Users className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-1">
              Manage Users
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              View, manage, and assign roles to all registered accounts.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-4 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Total Users</span>
            <span className="text-2xl font-black text-white">{users.length}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Users Table/List ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-[#111113]/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest font-bold">
                  <th className="p-5 pl-8">User Details</th>
                  <th className="p-5">Email Address</th>
                  <th className="p-5">Access Role</th>
                  <th className="p-5 pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <AnimatePresence>
                  {users.map((u, i) => {
                    const isAdmin = u.role === 'admin';
                    const isMe = u._id === currentUser?._id;

                    return (
                      <motion.tr 
                        key={u._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group hover:bg-white/[0.04] transition-colors ${isMe ? 'bg-blue-500/[0.02]' : ''}`}
                      >
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${
                              isAdmin 
                                ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-purple-400 ring-1 ring-purple-500/30' 
                                : 'bg-gradient-to-br from-blue-500/20 to-cyan-600/10 text-blue-400 ring-1 ring-blue-500/30'
                            }`}>
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-200 text-sm flex items-center gap-2">
                                {u.name || 'Unknown User'}
                                {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-gray-400 uppercase tracking-wider font-bold">You</span>}
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium">Joined recently</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className="text-gray-400 font-medium text-sm">{u.email}</span>
                        </td>
                        <td className="p-5">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                            isAdmin 
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            {u.role}
                          </div>
                        </td>
                        <td className="p-5 pr-8">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleRoleToggle(u._id, u.role)}
                              disabled={isMe}
                              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                                isMe 
                                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                  : isAdmin
                                    ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:scale-105'
                                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:scale-105'
                              }`}
                              title={isAdmin ? 'Demote to User' : 'Promote to Admin'}
                            >
                              {isAdmin ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => {
                                if (isMe) {
                                  alert("You cannot delete your own account.");
                                  return;
                                }
                                setDeleteId(u._id);
                              }}
                              disabled={isMe}
                              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                                isMe 
                                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-105'
                              }`}
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-600 mb-3" />
                        <span className="text-gray-400 font-medium">No users found.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Custom Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[#111113] border border-white/10 rounded-3xl w-full max-w-xs p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Delete User?</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                This action is permanent and will remove all data associated with this user.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  Yes, Delete User
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
