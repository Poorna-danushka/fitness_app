import { useState, useEffect, useMemo } from 'react';
import { workoutAPI } from '../api/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Flame, Clock, Dumbbell,
  ChevronLeft, ChevronRight, Loader2, AlertTriangle,
  Sunrise, Sun, Sunset, Moon, Activity, Calendar
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Exercise {
  _id: string;
  name: string;
  caloriesPer10Min: number;
  muscleGroup?: string;
}
interface Workout {
  _id: string;
  exerciseId: Exercise;
  duration: number;
  sets?: number;
  reps?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  caloriesBurned: number;
  date: string;
}

// ─── Time slot config ─────────────────────────────────────────────────────────
const TIME_SLOTS = [
  {
    key: 'morning', label: 'Morning', hours: [5, 6, 7, 8, 9, 10, 11],
    Icon: Sunrise, color: 'text-amber-400',
    bg: 'bg-amber-500/10', border: 'border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-400',
  },
  {
    key: 'afternoon', label: 'Afternoon', hours: [12, 13, 14, 15, 16],
    Icon: Sun, color: 'text-yellow-400',
    bg: 'bg-yellow-500/10', border: 'border-yellow-500/30',
    badge: 'bg-yellow-500/10 text-yellow-400',
  },
  {
    key: 'evening', label: 'Evening', hours: [17, 18, 19, 20],
    Icon: Sunset, color: 'text-orange-400',
    bg: 'bg-orange-500/10', border: 'border-orange-500/30',
    badge: 'bg-orange-500/10 text-orange-400',
  },
  {
    key: 'night', label: 'Night', hours: [21, 22, 23, 0, 1, 2, 3, 4],
    Icon: Moon, color: 'text-blue-400',
    bg: 'bg-blue-500/10', border: 'border-blue-500/30',
    badge: 'bg-blue-500/10 text-blue-400',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSlotKey(dateStr: string) {
  const h = new Date(dateStr).getHours();
  for (const s of TIME_SLOTS) {
    if (s.hours.includes(h)) return s.key;
  }
  return 'morning';
}

function fmt12(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function getWeekDays(offset: number): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  beginner:     0.75,
  intermediate: 1.00,
  advanced:     1.30,
};

function computeKcal(w: { caloriesBurned: number; duration: number; difficulty?: string; exerciseId: { caloriesPer10Min: number } }): number {
  if (w.caloriesBurned > 0) return w.caloriesBurned;
  const base       = w.exerciseId?.caloriesPer10Min || 50;
  const multiplier = DIFFICULTY_MULTIPLIER[w.difficulty ?? 'intermediate'] ?? 1.0;
  return Math.round((base * multiplier * w.duration) / 10);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Workouts() {
  const [workouts, setWorkouts]   = useState<Workout[]>([]);
  const [loading, setLoading]     = useState(true);

  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const wRes = await workoutAPI.getMy();
      setWorkouts(wRes.data.workouts || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  // ── Derived data ─────────────────────────────────────────────────────────────
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  const workoutsForDay = (d: Date) =>
    workouts.filter(w => sameDay(new Date(w.date), d));

  const dayGrouped = useMemo(() => {
    const map: Record<string, Workout[]> = {};
    workouts
      .filter(w => sameDay(new Date(w.date), selectedDate))
      .forEach(w => {
        const k = getSlotKey(w.date);
        (map[k] ??= []).push(w);
      });
    return map;
  }, [workouts, selectedDate]);

  const dayList = Object.values(dayGrouped).flat();
  const dayCalories = dayList.reduce((s, w) => s + computeKcal(w), 0);
  const dayMinutes  = dayList.reduce((s, w) => s + w.duration, 0);

  const totalCalories = workouts.reduce((s, w) => s + computeKcal(w), 0);
  const totalMinutes  = workouts.reduce((s, w) => s + w.duration, 0);

  const fmtMins = (m: number) =>
    m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;

  async function handleDelete(id: string) {
    try {
      await workoutAPI.delete(id);
      setDeleteId(null);
      loadData();
    } catch (err) {
      console.error('Error deleting workout:', err);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  const isToday = sameDay(selectedDate, new Date());
  const isFutureDay = selectedDate > new Date() && !isToday;
  const selLabel = isToday
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="pb-10 pt-4 space-y-8 relative text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 left-0 w-64 h-64 bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            My Workouts
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-500" />
            {workouts.length} session{workouts.length !== 1 ? 's' : ''} logged all-time
          </p>
        </div>
      </motion.div>

      {/* ── Overall stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sessions', value: workouts.length, Icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Total Kcal Burned', value: totalCalories > 999 ? `${(totalCalories/1000).toFixed(1)}k` : totalCalories, Icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
          { label: 'Total Time Spent', value: fmtMins(totalMinutes), Icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        ].map(({ label, value, Icon, color, bg, border }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5 }}
            className={`bg-[#111113]/80 backdrop-blur-sm border ${border} rounded-2xl p-5 shadow-xl transition-transform`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 ring-1 ring-white/5`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`font-display text-2xl md:text-3xl font-black ${color} tracking-tight`}>{value}</p>
            <p className="text-gray-500 text-xs md:text-sm font-medium mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Week strip ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#111113]/80 backdrop-blur-sm border border-white/10 rounded-3xl p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">
              {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : 'Past Week'}
            </span>
            <span className="text-sm font-medium text-gray-300">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <button
            onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}
            disabled={weekOffset >= 0}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {weekDays.map((day, i) => {
            const isSelected   = sameDay(day, selectedDate);
            const todayDay     = sameDay(day, new Date());
            const isFuture     = day > new Date() && !todayDay;
            const workoutsLen  = workoutsForDay(day).length;
            const dotCount     = Math.min(workoutsLen, 3);
            
            return (
              <button
                key={i}
                onClick={() => !isFuture && setSelectedDate(day)}
                disabled={isFuture}
                className={`relative flex flex-col items-center justify-center gap-1.5 py-3 md:py-4 rounded-2xl transition-all duration-300 active:scale-95 overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-b from-green-500/20 to-emerald-600/10 border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                    : todayDay
                    ? 'bg-white/10 border border-white/20 hover:bg-white/15'
                    : isFuture
                    ? 'opacity-20 cursor-not-allowed'
                    : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                }`}
              >
                {/* Subtle hover glow */}
                {!isFuture && !isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-b from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide z-10 ${isSelected ? 'text-green-300' : 'text-gray-500'}`}>
                  {DAY_SHORT[i]}
                </span>
                <span className={`font-display text-lg md:text-2xl font-bold z-10 ${isSelected ? 'text-white' : todayDay ? 'text-gray-200' : 'text-gray-400'}`}>
                  {day.getDate()}
                </span>
                <div className="flex gap-1 h-1.5 items-center z-10 mt-0.5">
                  {dotCount > 0
                    ? Array.from({ length: dotCount }, (_, j) => (
                        <span
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-green-600/70'}`}
                        />
                      ))
                    : <span className="w-1.5 h-1.5 opacity-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Day view ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              {selLabel}
              {isToday && <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs uppercase tracking-wider font-bold">Today</span>}
            </h2>
          </div>
          {dayList.length > 0 && (
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5 text-orange-400 font-bold text-sm">
                <Flame className="w-4 h-4" />{dayCalories} kcal
              </span>
              <div className="w-px h-4 bg-white/20" />
              <span className="flex items-center gap-1.5 text-purple-400 font-bold text-sm">
                <Clock className="w-4 h-4" />{fmtMins(dayMinutes)}
              </span>
            </div>
          )}
        </div>

        {dayList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111113]/50 border border-white/5 border-dashed rounded-3xl p-12 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-5 ring-1 ring-white/10">
              <Dumbbell className="w-8 h-8 text-gray-600" />
            </div>
            <p className="font-display text-xl font-bold text-gray-300 mb-2">
              {isFutureDay ? 'Future day — plan ahead!' : isToday ? 'No workouts logged yet' : 'Rest day'}
            </p>
            <p className="text-gray-500 max-w-sm">
              {isToday
                ? 'Ready to crush your goals? Log your first session today to keep your streak alive.'
                : isFutureDay
                ? 'Select a past or current day to view your workout history.'
                : 'Your body needs rest to grow. No activity recorded for this day.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {TIME_SLOTS.map(slot => {
                const slotWorkouts = dayGrouped[slot.key];
                if (!slotWorkouts?.length) return null;
                
                return (
                  <motion.div 
                    key={slot.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-lg ${slot.bg} flex items-center justify-center border border-white/5`}>
                        <slot.Icon className={`w-4 h-4 ${slot.color}`} />
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-widest ${slot.color}`}>
                        {slot.label}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-2" />
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                        {slotWorkouts.length} session{slotWorkouts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {slotWorkouts.map((w, idx) => {
                        const sets = w.sets ?? 0;
                        const hasSets = sets > 0;

                        return (
                          <motion.div
                            key={w._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            className={`group bg-[#151518] border border-white/[0.05] hover:${slot.border} rounded-2xl p-5 transition-all duration-300 relative overflow-hidden`}
                          >
                            {/* Hover accent line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${slot.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
                            
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 min-w-0">
                                <div className={`w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 shadow-inner`}>
                                  <Dumbbell className={`w-5 h-5 ${slot.color}`} />
                                </div>
                                <div className="min-w-0 py-0.5">
                                  <p className="font-bold text-white text-base truncate mb-1">
                                    {w.exerciseId?.name || 'Custom Exercise'}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1.5 text-gray-400">
                                      <Clock className="w-3.5 h-3.5" />{w.duration} min
                                    </span>
                                    {hasSets && (
                                      <>
                                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span className="text-gray-400">
                                          {w.sets} sets{w.reps ? ` × ${w.reps}` : ''}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-3 shrink-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 text-gray-300`}>
                                    {fmt12(w.date)}
                                  </span>
                                  <button
                                    onClick={() => setDeleteId(w._id)}
                                    className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="flex items-center gap-1.5 text-sm text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                                  <Flame className="w-3.5 h-3.5" />
                                  {computeKcal(w)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Tags row */}
                            <div className="mt-4 flex flex-wrap gap-2 pl-16">
                              {w.exerciseId?.muscleGroup && (
                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                                  {w.exerciseId.muscleGroup}
                                </span>
                              )}
                              {w.difficulty && w.difficulty !== 'intermediate' && (
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                                  w.difficulty === 'advanced'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {w.difficulty}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ── Delete Confirm ── */}
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
              <h3 className="font-display text-2xl font-bold text-white mb-2">Delete Session?</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">This workout will be permanently removed from your history.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  Yes, Delete It
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