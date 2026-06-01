import { useState, useEffect, useMemo } from 'react';
import { workoutAPI, exerciseAPI } from '../api/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Flame, Clock, Dumbbell,
  ChevronLeft, ChevronRight, Loader2, AlertTriangle,
  Sunrise, Sun, Sunset, Moon, Activity
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
    bg: 'bg-amber-500/10', border: 'border-l-amber-500/50',
    badge: 'bg-amber-500/10 text-amber-400',
  },
  {
    key: 'afternoon', label: 'Afternoon', hours: [12, 13, 14, 15, 16],
    Icon: Sun, color: 'text-yellow-400',
    bg: 'bg-yellow-500/10', border: 'border-l-yellow-500/50',
    badge: 'bg-yellow-500/10 text-yellow-400',
  },
  {
    key: 'evening', label: 'Evening', hours: [17, 18, 19, 20],
    Icon: Sunset, color: 'text-orange-400',
    bg: 'bg-orange-500/10', border: 'border-l-orange-500/50',
    badge: 'bg-orange-500/10 text-orange-400',
  },
  {
    key: 'night', label: 'Night', hours: [21, 22, 23, 0, 1, 2, 3, 4],
    Icon: Moon, color: 'text-blue-400',
    bg: 'bg-blue-500/10', border: 'border-l-blue-500/50',
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

// Mirrors the backend multipliers so we can display accurate kcal for old
// workouts that were saved before the per-exercise calorie rate was added.
const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  beginner:     0.75,
  intermediate: 1.00,
  advanced:     1.30,
};

function computeKcal(w: { caloriesBurned: number; duration: number; difficulty?: string; exerciseId: { caloriesPer10Min: number } }): number {
  if (w.caloriesBurned > 0) return w.caloriesBurned;
  // Fallback: recalculate client-side for legacy records saved with 0 kcal
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
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  const isToday = sameDay(selectedDate, new Date());
  const isFutureDay = selectedDate > new Date() && !isToday;
  const selLabel = isToday
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
      });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="pb-4 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white leading-tight">
            My Workouts
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {workouts.length} session{workouts.length !== 1 ? 's' : ''} logged
          </p>
        </div>
      </div>

      {/* ── Overall stats ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Sessions', value: workouts.length, Icon: Activity, c: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Kcal Burned', value: totalCalories > 999 ? `${(totalCalories/1000).toFixed(1)}k` : totalCalories, Icon: Flame, c: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Total Time', value: fmtMins(totalMinutes), Icon: Clock, c: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ label, value, Icon, c, bg }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card-surface rounded-2xl p-3.5"
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2.5`}>
              <Icon className={`w-4 h-4 ${c}`} />
            </div>
            <p className={`font-display text-xl font-bold ${c}`}>{value}</p>
            <p className="text-gray-600 text-[11px] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Week strip ── */}
      <div className="card-surface rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
            {weekOffset === 0
              ? 'This Week'
              : weekOffset === -1
              ? 'Last Week'
              : `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
          <button
            onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}
            disabled={weekOffset >= 0}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const isSelected   = sameDay(day, selectedDate);
            const todayDay     = sameDay(day, new Date());
            const isFuture     = day > new Date() && !todayDay;
            const dotCount     = Math.min(workoutsForDay(day).length, 3);
            return (
              <button
                key={i}
                onClick={() => !isFuture && setSelectedDate(day)}
                disabled={isFuture}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-green-500/20 border border-green-500/40'
                    : todayDay
                    ? 'bg-white/[0.05] border border-white/[0.08]'
                    : isFuture
                    ? 'opacity-25 cursor-not-allowed'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-[9px] font-bold text-gray-600 uppercase">{DAY_SHORT[i]}</span>
                <span
                  className={`font-display text-sm font-bold ${
                    isSelected ? 'text-green-400' : todayDay ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="flex gap-0.5 h-1.5 items-center">
                  {dotCount > 0
                    ? Array.from({ length: dotCount }, (_, j) => (
                        <span
                          key={j}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-green-400' : 'bg-green-500/50'
                          }`}
                        />
                      ))
                    : <span className="w-1 h-1" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Day view ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-white">{selLabel}</h2>
          {dayList.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-orange-400 font-semibold">
                <Flame className="w-3.5 h-3.5" />{dayCalories} kcal
              </span>
              <span className="flex items-center gap-1 text-purple-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />{fmtMins(dayMinutes)}
              </span>
            </div>
          )}
        </div>

        {dayList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-surface rounded-2xl p-8 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3">
              <Dumbbell className="w-6 h-6 text-gray-700" />
            </div>
            <p className="font-display text-lg font-bold text-gray-500 mb-1">
              {isFutureDay
                ? 'Future day — plan ahead!'
                : isToday
                ? 'No workouts yet today'
                : 'Rest day'}
            </p>
            <p className="text-gray-700 text-sm mb-5">
              {isToday
                ? 'Ready to crush it? Log your first session.'
                : isFutureDay
                ? 'Select a past or current day to log.'
                : 'No activity recorded for this day.'}
            </p>

          </motion.div>
        ) : (
          <div className="space-y-4">
            {TIME_SLOTS.map(slot => {
              const slotWorkouts = dayGrouped[slot.key];
              if (!slotWorkouts?.length) return null;
              return (
                <div key={slot.key}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className={`w-6 h-6 rounded-lg ${slot.bg} flex items-center justify-center`}>
                      <slot.Icon className={`w-3.5 h-3.5 ${slot.color}`} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${slot.color}`}>
                      {slot.label}
                    </span>
                    <span className="text-gray-700 text-xs ml-auto">
                      {slotWorkouts.length} session{slotWorkouts.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {slotWorkouts.map((w, idx) => {
                      const sets = w.sets ?? 0;
                      const hasSets = sets > 0;

                      return (
                        <motion.div
                          key={w._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`bg-[#0d0d0d] border border-white/[0.06] border-l-2 ${slot.border} rounded-xl p-4 transition-all duration-300`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Left: icon + info */}
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl ${slot.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <Dumbbell className={`w-5 h-5 ${slot.color}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-sm truncate leading-tight">
                                  {w.exerciseId?.name || 'Exercise'}
                                </p>
                                {w.exerciseId?.muscleGroup && (
                                  <p className="text-[11px] text-gray-600 mt-0.5">
                                    {w.exerciseId.muscleGroup}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />{w.duration} min
                                  </span>
                                  {hasSets && (
                                    <span className="text-xs text-gray-600">
                                      {w.sets} sets{w.reps ? ` × ${w.reps}` : ''}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold">
                                    <Flame className="w-3 h-3" />
                                    {computeKcal(w)} kcal
                                  </span>
                                  {w.difficulty && w.difficulty !== 'intermediate' && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                      w.difficulty === 'advanced'
                                        ? 'bg-red-500/10 text-red-400'
                                        : 'bg-blue-500/10 text-blue-400'
                                    }`}>
                                      {w.difficulty}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: time badge + controls */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${slot.badge}`}>
                                {fmt12(w.date)}
                              </span>

                              {/* Controls */}
                              <div className="flex items-center gap-1 mt-1">
                                <button
                                  onClick={() => setDeleteId(w._id)}
                                  className="text-gray-700 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>



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
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              className="relative bg-[#0e0e0e] border border-white/[0.08] rounded-2xl w-full max-w-xs p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-1">Delete Workout?</h3>
              <p className="text-gray-600 text-sm mb-5">This session will be permanently removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-semibold text-sm transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}