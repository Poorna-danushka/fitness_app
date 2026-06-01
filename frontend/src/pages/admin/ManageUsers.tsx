import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Shield, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);

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

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?._id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error(error);
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="text-white space-y-8 pb-12">
      <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Users</h1>
          <p className="text-gray-400 text-sm">View and manage all registered accounts.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-400">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold">
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-200">{u.name || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      >
                        {u.role === 'admin' ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(u._id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
