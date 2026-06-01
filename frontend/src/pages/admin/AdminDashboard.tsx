import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { motion } from 'framer-motion';
import { Users, Package, CreditCard, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, packages: 0, purchases: 0, revenue: 0 });
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, pkgsRes, purchasesRes] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getAllPackages(),
          adminAPI.getAllPurchases(),
        ]);

        const allPurchases: any[] = purchasesRes.data.purchases || [];
        const totalRevenue = allPurchases.reduce((sum: number, p: any) => sum + (p.packageId?.price || 0), 0);

        setPurchases(allPurchases);
        setStats({
          users: usersRes.data.users?.length ?? 0,
          packages: pkgsRes.data.packages?.length ?? 0,
          purchases: allPurchases.length,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Build monthly purchases chart from real data
  const monthlyChart = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts: Record<string, { sales: number; revenue: number }> = {};
    months.forEach(m => (counts[m] = { sales: 0, revenue: 0 }));

    purchases.forEach((p: any) => {
      const month = months[new Date(p.createdAt).getMonth()];
      if (counts[month]) {
        counts[month].sales += 1;
        counts[month].revenue += p.packageId?.price || 0;
      }
    });

    // Only show months up to current month
    const currentMonth = new Date().getMonth();
    return months.slice(0, currentMonth + 1).map(m => ({ name: m, ...counts[m] }));
  })();

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      sub: `From ${stats.purchases} sales`,
      icon: <CreditCard className="w-5 h-5 text-green-400" />,
      iconBg: 'bg-green-500/10',
      trend: stats.purchases > 0 ? '+' + stats.purchases : '0',
    },
    {
      title: 'Total Users',
      value: stats.users,
      sub: 'Registered accounts',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-500/10',
      trend: stats.users > 0 ? stats.users + ' total' : 'None yet',
    },
    {
      title: 'Packages',
      value: stats.packages,
      sub: 'Active fitness plans',
      icon: <Package className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-500/10',
      trend: stats.packages + ' plans',
    },
    {
      title: 'Total Sales',
      value: stats.purchases,
      sub: 'Package purchases',
      icon: <Activity className="w-5 h-5 text-orange-400" />,
      iconBg: 'bg-orange-500/10',
      trend: stats.purchases + ' orders',
    },
  ];

  return (
    <div className="space-y-8 text-white pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.name}. Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-[#0d0d0d]"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1">{stat.title}</p>
            <p className="text-2xl font-bold mb-1">{loading ? '...' : stat.value}</p>
            <p className="text-gray-600 text-xs">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by month */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 border border-white/[0.06] bg-[#0d0d0d] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Revenue by Month</h3>
              <p className="text-xs text-gray-600 mt-0.5">Calculated from real purchases</p>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              ${stats.revenue.toLocaleString()}
            </div>
          </div>
          <div className="h-64 w-full">
            {monthlyChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256} minHeight={180}>
                <BarChart data={monthlyChart} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                  <YAxis stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d0d', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    formatter={(val: any) => [`$${val}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {monthlyChart.map((_, i) => (
                      <Cell key={i} fill={i === monthlyChart.length - 1 ? '#22c55e' : '#22c55e55'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Sales by month */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 border border-white/[0.06] bg-[#0d0d0d] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Sales by Month</h3>
              <p className="text-xs text-gray-600 mt-0.5">Number of packages sold</p>
            </div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
              <Activity className="w-4 h-4" />
              {stats.purchases} total
            </div>
          </div>
          <div className="h-64 w-full">
            {monthlyChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256} minHeight={180}>
                <BarChart data={monthlyChart} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                  <YAxis stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d0d', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    formatter={(val: any) => [val, 'Sales']}
                  />
                  <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                    {monthlyChart.map((_, i) => (
                      <Cell key={i} fill={i === monthlyChart.length - 1 ? '#3b82f6' : '#3b82f655'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent purchases table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="border border-white/[0.06] bg-[#0d0d0d] rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-bold">Recent Purchases</h3>
          <p className="text-xs text-gray-600 mt-0.5">Latest 5 transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.04] text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Package</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.slice(0, 5).map((p: any) => (
                <tr key={p._id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm flex items-center justify-center">
                        {(p.userId?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-200">{p.userId?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{p.packageId?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-400">${p.packageId?.price || p.price || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-600 text-sm">No purchases yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
