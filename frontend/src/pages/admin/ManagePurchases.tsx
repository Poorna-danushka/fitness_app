import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { ShoppingCart, Package, CalendarDays, Receipt, TrendingUp, CheckCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Calculate some basic stats
  const totalRevenue = purchases.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const activeCount = purchases.filter(p => p.status === 'paid' || p.status === 'active' || p.status === undefined).length;

  return (
    <div className="pb-12 space-y-8 relative text-white min-h-[80vh]">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111113]/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/10 flex items-center justify-center ring-1 ring-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
            <ShoppingCart className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-1">
              Manage Purchases
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Track package sales, active subscriptions, and revenue.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-4 shadow-inner">
            <TrendingUp className="w-5 h-5 text-green-400 opacity-80" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Revenue</span>
              <span className="text-xl font-black text-white">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-4 shadow-inner">
            <Activity className="w-5 h-5 text-orange-400 opacity-80" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Active Plans</span>
              <span className="text-xl font-black text-white">{activeCount}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Purchases Table ── */}
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
                  <th className="p-5 pl-8">Customer Details</th>
                  <th className="p-5">Package Purchased</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Purchase Date</th>
                  <th className="p-5 pr-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <AnimatePresence>
                  {purchases.map((p, i) => (
                    <motion.tr 
                      key={p._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="p-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/10 text-orange-400 flex items-center justify-center font-bold text-lg ring-1 ring-orange-500/30 shadow-inner">
                            {(p.userId?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-200 text-sm group-hover:text-white transition-colors">
                              {p.userId?.name || p.userId || 'Unknown User'}
                            </span>
                            {p.userId?.email && (
                              <span className="text-[11px] text-gray-500 font-medium">{p.userId.email}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                          <span className="text-gray-300 font-medium text-sm group-hover:text-white transition-colors">
                            {p.packageId?.name || p.packageId || 'Custom Plan'}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-emerald-400 font-bold tracking-wide">
                          ${(p.price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-400 text-sm font-medium">
                            {new Date(p.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-5 pr-8">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                          <Receipt className="w-8 h-8 text-gray-600" />
                        </div>
                        <span className="text-gray-300 font-bold text-lg mb-1">No purchases yet</span>
                        <span className="text-gray-500 text-sm">When users buy packages, they will appear here.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
