import { useState, useEffect } from 'react';
import { purchaseAPI, workoutAPI } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, Flame, TrendingUp, Trophy, Dumbbell, ArrowRight, Zap, PackageCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Build a 7-day skeleton keyed to real day names, populated from workouts
function buildWeekData(workouts: any[]) {
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { day: DAYS[d.getDay()], date: d.toDateString(), count: 0, calories: 0 };
  });

  workouts.forEach((w: any) => {
    const wDate = new Date(w.date || w.createdAt).toDateString();
    const slot = week.find(s => s.date === wDate);
    if (slot) {
      slot.count += 1;
      slot.calories += computeKcal(w);
    }
  });

  return week.map(w => ({ day: w.day, workouts: w.count, calories: w.calories }));
}

// Mirrors the backend multiplier so old workouts (caloriesBurned=0) still show correct kcal
const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  beginner: 0.75, intermediate: 1.00, advanced: 1.30,
};
function computeKcal(w: any): number {
  if (w.caloriesBurned > 0) return w.caloriesBurned;
  const base       = w.exerciseId?.caloriesPer10Min || 50;
  const multiplier = DIFFICULTY_MULTIPLIER[w.difficulty ?? 'intermediate'] ?? 1.0;
  return Math.round((base * multiplier * (w.duration || 0)) / 10);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-gray-400 font-medium mb-1">{label}</p>
        <p className="text-green-400 font-bold">{payload[0]?.value} kcal</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [activePackage, setActivePackage] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [purchaseRes, workoutRes] = await Promise.all([
          purchaseAPI.getMy(),
          workoutAPI.getMy().catch(() => ({ data: { workouts: [] } })),
        ]);

        const purchases = purchaseRes.data.purchases || [];
        if (purchases.length > 0) {
          setActivePackage(purchases[0].packageId);
          setExercises(purchases[0].packageId?.exercises || []);
        }

        const workoutList = workoutRes.data?.workouts || [];
        setWorkouts(workoutList);
        setWeekData(buildWeekData(workoutList));
      } catch (error) {
        console.error('Dashboard fetch error', error);
        setWeekData(buildWeekData([]));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalCalories = workouts.reduce((sum, w) => sum + computeKcal(w), 0);
  const totalWorkouts = workouts.length;
  // Streak: count consecutive days with at least 1 completed exercise
  const streak = (() => {
    if (workouts.length === 0) return 0;
    const days = new Set(
      workouts.map((w: any) => new Date(w.date || w.createdAt).toDateString())
    );
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (days.has(d.toDateString())) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  // Filter exercises completed today
  const todayStr = new Date().toDateString();
  const todayWorkouts = workouts.filter(w => new Date(w.date || w.createdAt).toDateString() === todayStr);
  const todayCompletedExerciseIds = new Set(todayWorkouts.map(w => w.exerciseId?._id || w.exerciseId));
  const remainingExercises = exercises.filter(ex => !todayCompletedExerciseIds.has(ex._id));

  const stats = [
    {
      title: 'Active Plan',
      value: loading ? '...' : activePackage ? activePackage.name : 'None',
      sub: activePackage ? `${exercises.length} exercises included` : 'Browse packages to start',
      icon: Trophy,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10',
      accent: 'from-yellow-500/10 to-transparent',
    },
    {
      title: 'Total Workouts',
      value: loading ? '...' : totalWorkouts,
      sub: totalWorkouts === 0 ? 'No workouts yet' : 'Exercises completed',
      icon: Activity,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10',
      accent: 'from-green-500/10 to-transparent',
    },
    {
      title: 'Calories Burned',
      value: loading ? '...' : totalCalories > 0 ? totalCalories.toLocaleString() : '0',
      sub: totalWorkouts > 0 ? `Across ${totalWorkouts} session${totalWorkouts !== 1 ? 's' : ''}` : 'Log a workout to start tracking',
      icon: Flame,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10',
      accent: 'from-orange-500/10 to-transparent',
    },
    {
      title: 'Current Streak',
      value: loading ? '...' : streak > 0 ? `${streak} Day${streak > 1 ? 's' : ''}` : '0 Days',
      sub: streak === 0 ? 'Start working out today!' : 'Keep going!',
      icon: TrendingUp,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      accent: 'from-blue-500/10 to-transparent',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm">Here's your fitness overview for this week.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${stat.accent} border border-white/[0.06] bg-[#0d0d0d]`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className="text-gray-500 text-xs font-medium mb-1">{stat.title}</p>
              <p className="font-display text-2xl font-bold text-white leading-none mb-1">{stat.value}</p>
              <p className="text-gray-600 text-xs">{stat.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl p-5 md:p-6 border border-white/[0.06] bg-[#0d0d0d]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Activity Overview</h3>
              <p className="text-xs text-gray-600 mt-0.5">Estimated calories burned this week</p>
            </div>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              This Week
            </span>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height={256} minHeight={180}>
              <AreaChart data={weekData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                <YAxis stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#calGrad)" dot={false} activeDot={{ r: 4, fill: '#22c55e', stroke: '#000', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Exercises from active package */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 md:p-6 border border-white/[0.06] bg-[#0d0d0d] flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-bold text-white">My Exercises</h3>
          </div>

          {exercises.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <PackageCheck className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-600 text-sm">No active package yet.</p>
              <Link to="/packages" className="text-green-400 text-sm font-semibold hover:text-green-300">
                Browse Packages →
              </Link>
            </div>
          ) : remainingExercises.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-green-400 text-sm font-bold">All done for today!</p>
              <p className="text-gray-600 text-xs">You've completed all exercises in your plan.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto">
              {remainingExercises.slice(0, 5).map((ex: any, i: number) => (
                <Link
                  key={ex._id || i}
                  to={`/exercises/${ex._id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                    <Dumbbell className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
                    <p className="text-xs text-gray-600">{ex.muscleGroup}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-green-400 ml-auto shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/my-package"
            className="flex items-center justify-center gap-2 w-full mt-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-gray-500 hover:text-white hover:bg-white/[0.07] transition-all font-medium"
          >
            View full plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid sm:grid-cols-2 gap-4"
      >
        <Link
          to="/packages"
          className="rounded-2xl p-5 flex items-center gap-4 border border-white/[0.06] bg-[#0d0d0d] hover:border-green-500/30 hover:bg-green-500/[0.03] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Browse Packages</p>
            <p className="text-xs text-gray-600 mt-0.5">Upgrade your fitness plan</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-green-400 ml-auto transition-colors" />
        </Link>
        <Link
          to="/workouts"
          className="rounded-2xl p-5 flex items-center gap-4 border border-white/[0.06] bg-[#0d0d0d] hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
            <Dumbbell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">My Workouts</p>
            <p className="text-xs text-gray-600 mt-0.5">Log & track your sessions</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-blue-400 ml-auto transition-colors" />
        </Link>
      </motion.div>
    </div>
  );
}