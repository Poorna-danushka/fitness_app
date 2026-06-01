import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';

export default function ManagePurchases() {
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await adminAPI.getAllPurchases();
      setPurchases(res.data.purchases || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="text-white space-y-8 pb-12">
      <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Purchases</h1>
          <p className="text-gray-400 text-sm">Track all package sales and subscriptions.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-400">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Package</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
                        {(p.userId?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-200">{p.userId?.name || p.userId}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 font-medium">{p.packageId?.name || p.packageId}</td>
                  <td className="p-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No purchases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
