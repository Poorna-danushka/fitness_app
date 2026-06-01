import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { exerciseAPI, completedExerciseAPI, workoutAPI } from '../api/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, Square, SkipForward,
  RotateCcw, Trophy, Flame, ChevronRight, Clock,
  Dumbbell, Timer,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackageConfig {
  reps: string;
  sets: number;
  restTime: number;  // seconds between sets
  duration: number;  // total session minutes
  difficulty: string;
  notes: string;
  order: number;
}

type Phase = 'preview' | 'working' | 'resting' | 'done';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(s: number): string {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
}

// Ring SVG radius=54, circumference≈339
const CIRC = 2 * Math.PI * 54;
function Ring({ progress, color }: { progress: number; color: string }) {
  const dash = CIRC * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
      <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
      <circle
        cx="60" cy="60" r="54"
        stroke={color} strokeWidth="8" fill="none"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset 0.95s linear' }}
      />
    </svg>
  );
}

// ─── Time Calculation ─────────────────────────────────────────────────────────
// Total session = (sets × setSeconds) + (sets−1) × restSeconds
// → setSeconds = (duration×60 − (sets−1)×restSeconds) / sets

function calcSetSeconds(sets: number, restSeconds: number, totalMinutes: number): number {
  const totalSecs    = totalMinutes * 60;
  const totalRest    = (sets - 1) * restSeconds;
  const activeWork   = Math.max(sets * 10, totalSecs - totalRest);
  return Math.max(10, Math.floor(activeWork / sets));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExerciseView() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const location   = useLocation();

  const pkgConfig  = (location.state as { packageConfig?: PackageConfig } | null)?.packageConfig;

  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  // ── Timing constants (derived from pkgConfig, stable for the session) ────────
  const totalSets   = pkgConfig?.sets     ?? 3;
  const restSeconds = pkgConfig?.restTime ?? 60;
  const totalMins   = pkgConfig?.duration ?? 15;
  const setSeconds  = calcSetSeconds(totalSets, restSeconds, totalMins);

  // Total session = sets × setSeconds + (sets−1) × restSeconds  [seconds]
  const totalSessionSecs = totalSets * setSeconds + (totalSets - 1) * restSeconds;

  // ── Live state ───────────────────────────────────────────────────────────────
  const [phase,      setPhase]      = useState<Phase>('preview');
  const [currentSet, setCurrentSet] = useState(1);
  const [phaseTimer, setPhaseTimer] = useState(setSeconds); // counts DOWN in current phase
  const [isPaused,   setIsPaused]   = useState(false);
  const [elapsed,    setElapsed]    = useState(0);          // total seconds elapsed (for save)
  const [savedOk,    setSavedOk]    = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch exercise ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await exerciseAPI.getById(id!);
        setExercise(res.data.exercise);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  // ── Tick management ──────────────────────────────────────────────────────────
  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  // ── Phase transition helpers ─────────────────────────────────────────────────
  const goToRest = useCallback((completedSet: number) => {
    stopTick();
    if (completedSet >= totalSets) {
      // All sets done
      setPhase('done');
    } else {
      setPhaseTimer(restSeconds);
      setPhase('resting');
    }
  }, [stopTick, totalSets, restSeconds]);

  const goToNextSet = useCallback((nextSet: number) => {
    stopTick();
    setCurrentSet(nextSet);
    setPhaseTimer(setSeconds);
    setPhase('working');
  }, [stopTick, setSeconds]);

  // ── Tick effect ──────────────────────────────────────────────────────────────
  useEffect(() => {
    stopTick();
    if (isPaused || phase === 'preview' || phase === 'done') return;

    tickRef.current = setInterval(() => {
      setElapsed(e => e + 1);
      setPhaseTimer(t => {
        if (t <= 1) {
          // Phase expired — transition
          if (phase === 'working') {
            goToRest(currentSet);
          } else {
            goToNextSet(currentSet + 1);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return stopTick;
  }, [phase, isPaused, currentSet, goToRest, goToNextSet, stopTick]);

  // ── Save on done ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'done' || savedOk || !exercise) return;
    const durationMins = Math.max(1, Math.round(elapsed / 60));
    completedExerciseAPI.markComplete(id!).catch(console.error);
    workoutAPI.create({
      exerciseId: id!,
      duration: durationMins,
      sets: totalSets,
      reps: pkgConfig?.reps ? parseInt(pkgConfig.reps) || null : null,
      date: new Date().toISOString(),
      // Pass difficulty from the package config so the backend can apply the
      // correct calorie multiplier (beginner 0.75× / intermediate 1.0× / advanced 1.3×)
      difficulty: pkgConfig?.difficulty ?? 'intermediate',
    }).catch(console.error);
    setSavedOk(true);
  }, [phase, savedOk, exercise, elapsed, id, totalSets, pkgConfig]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const startWorkout = () => {
    setPhase('working');
    setCurrentSet(1);
    setPhaseTimer(setSeconds);
    setIsPaused(false);
    setElapsed(0);
    setSavedOk(false);
  };

  const pauseResume = () => setIsPaused(p => !p);

  const stopWorkout = useCallback(() => {
    stopTick();
    setPhase('preview');
    setCurrentSet(1);
    setPhaseTimer(setSeconds);
    setIsPaused(false);
    setElapsed(0);
    setSavedOk(false);
  }, [stopTick, setSeconds]);

  const skipRest = useCallback(() => {
    goToNextSet(currentSet + 1);
  }, [goToNextSet, currentSet]);

  const doAgain = () => {
    stopTick();
    setPhase('preview');
    setCurrentSet(1);
    setPhaseTimer(setSeconds);
    setIsPaused(false);
    setElapsed(0);
    setSavedOk(false);
  };

  // ── Derived display values ───────────────────────────────────────────────────
  // Remaining total time: current phase time left + future sets + future rests
  function calcTotalRemaining(): number {
    if (phase === 'done') return 0;
    if (phase === 'preview') return totalSessionSecs;
    const setsLeft = totalSets - currentSet;           // sets after current
    if (phase === 'working') {
      return phaseTimer + setsLeft * (setSeconds + restSeconds);
    }
    // resting
    return phaseTimer + setsLeft * setSeconds + (setsLeft - 1) * restSeconds;
  }
  const totalRemaining = calcTotalRemaining();
  const overallProgress = 1 - totalRemaining / totalSessionSecs;

  // ── Loading / not found ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!exercise) {
    return <div className="text-white text-center py-20">Exercise not found</div>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── DONE ─────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const actualMins = Math.max(1, Math.round(elapsed / 60));
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-white">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm w-full"
        >
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
            className="w-28 h-28 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
          >
            <Trophy className="w-14 h-14 text-green-400" />
          </motion.div>

          <h1 className="text-5xl font-black mb-2">Crushed It!</h1>
          <p className="text-gray-400 text-lg mb-1">{exercise.name}</p>
          <p className="text-green-400 font-bold text-xl mb-8">{totalSets} sets complete ✓</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: '🏋️', label: 'Sets',     value: String(totalSets) },
              { icon: '🔁', label: 'Per Set',  value: fmtTime(setSeconds) },
              { icon: '⏱',  label: 'Duration', value: `${actualMins}m`   },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-bold text-lg">{s.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {savedOk && (
            <p className="text-xs text-green-500/70 mb-6">✓ Workout saved to your history</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={doAgain}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Do Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-500 text-black rounded-xl font-bold hover:bg-green-400 transition-all"
            >
              Back to Plan <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── WORKING / RESTING ─────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'working' || phase === 'resting') {
    const isResting  = phase === 'resting';
    const phaseMax   = isResting ? restSeconds : setSeconds;
    const ringProg   = phaseTimer / phaseMax;             // drains left→right
    const ringColor  = isResting ? '#facc15' : '#22c55e';

    return (
      <div className="min-h-screen flex flex-col text-white select-none">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {/* Stop */}
          <button
            onClick={stopWorkout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all active:scale-95 text-sm font-bold"
          >
            <Square className="w-3.5 h-3.5 fill-red-400" /> Stop
          </button>

          {/* Set progress pills */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSets }).map((_, i) => {
              const done    = i < currentSet - 1;
              const active  = i === currentSet - 1;
              return (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    done   ? 'w-6 bg-green-500' :
                    active ? (isResting ? 'w-4 bg-yellow-400' : 'w-5 bg-green-400 animate-pulse') :
                             'w-2 bg-white/10'
                  }`}
                />
              );
            })}
          </div>

          {/* Reset */}
          <button
            onClick={stopWorkout}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-600 hover:text-white hover:bg-white/10 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* ── Exercise image ── */}
        <div className="relative h-40 mx-5 rounded-2xl overflow-hidden border border-white/10">
          <img
            src={exercise.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'}
            alt={exercise.name}
            className={`w-full h-full object-cover transition-all duration-500 ${isResting ? 'opacity-20 blur-sm scale-105' : 'opacity-65'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{exercise.muscleGroup}</span>
            <h2 className="text-xl font-black leading-tight">{exercise.name}</h2>
          </div>
          {/* Phase badge */}
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                isResting
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}
            >
              {isResting ? '⏸ Rest' : '🔥 Working'}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ── Main timer + controls ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 gap-6">

          {/* Ring + phase countdown */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${currentSet}`}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              className="relative w-52 h-52"
            >
              <Ring progress={ringProg} color={ringColor} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {/* Paused indicator */}
                {isPaused && (
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 animate-pulse">Paused</span>
                )}
                {/* Big countdown */}
                <span className="text-5xl font-black tabular-nums leading-none">
                  {fmtTime(phaseTimer)}
                </span>
                {/* Phase label */}
                <span className={`text-xs font-bold uppercase tracking-widest ${isResting ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isResting ? `Rest · Set ${currentSet + 1} next` : `Set ${currentSet} / ${totalSets}`}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Overall progress bar + remaining */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-[11px] text-gray-600 mb-1.5">
              <span>Overall progress</span>
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" /> {fmtTime(totalRemaining)} remaining
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500/60 rounded-full"
                animate={{ width: `${Math.round(overallProgress * 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Stats row: reps · set · rest */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-xl font-black text-green-400">{pkgConfig?.reps ?? '—'}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Reps</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-black">
                {currentSet}<span className="text-gray-600 text-base">/{totalSets}</span>
              </p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Set</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-black text-yellow-400">{restSeconds}s</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Rest</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-black text-purple-400">{fmtTime(setSeconds)}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">/ Set</p>
            </div>
          </div>

          {/* Notes */}
          {pkgConfig?.notes && (
            <p className="text-xs text-gray-600 italic text-center max-w-xs">"{pkgConfig.notes}"</p>
          )}

          {/* Action buttons */}
          <div className="w-full max-w-xs flex flex-col gap-3">
            {isResting ? (
              <>
                {/* Pause during rest */}
                <button
                  onClick={pauseResume}
                  className={`w-full py-4 font-black text-lg rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    isPaused
                      ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_24px_rgba(34,197,94,0.35)]'
                      : 'bg-white/[0.06] border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isPaused
                    ? <><Play className="w-5 h-5 fill-black" /> Resume</>
                    : <><Pause className="w-5 h-5" /> Pause Rest</>
                  }
                </button>
                {/* Skip rest */}
                <button
                  onClick={skipRest}
                  className="w-full py-3.5 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-2xl hover:bg-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip Rest · Start Set {currentSet + 1}
                </button>
              </>
            ) : (
              <>
                {/* Pause / Resume — primary */}
                <button
                  onClick={pauseResume}
                  className={`w-full py-4 font-black text-lg rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    isPaused
                      ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_24px_rgba(34,197,94,0.35)]'
                      : 'bg-white/[0.06] border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isPaused
                    ? <><Play className="w-5 h-5 fill-black" /> Resume</>
                    : <><Pause className="w-5 h-5" /> Pause</>
                  }
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── PREVIEW ───────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="pb-16 text-white max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-green-400 mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Package
      </button>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl overflow-hidden border border-white/10 bg-gray-900 aspect-square"
        >
          <img
            src={exercise.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold uppercase tracking-wider rounded w-max mb-4">
            {exercise.muscleGroup}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-3">{exercise.name}</h1>
          <p className="text-gray-400 text-base mb-6 leading-relaxed">{exercise.description}</p>

          {pkgConfig ? (
            <>
              {/* Session breakdown card */}
              <div className="mb-5 p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Session Breakdown</p>

                {/* 4 stats */}
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  {[
                    { label: 'Total',   value: `${totalMins}m`,         color: 'text-purple-400', Icon: Clock   },
                    { label: 'Per Set', value: fmtTime(setSeconds),     color: 'text-green-400',  Icon: Timer   },
                    { label: 'Sets',    value: String(totalSets),       color: 'text-blue-400',   Icon: Dumbbell},
                    { label: 'Rest',    value: `${restSeconds}s`,       color: 'text-yellow-400', Icon: Pause   },
                  ].map(s => (
                    <div key={s.label} className="bg-white/[0.04] rounded-xl p-2.5">
                      <s.Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${s.color}`} />
                      <p className={`font-black text-sm ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-gray-600 uppercase tracking-wide mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Visual timeline bar */}
                <div className="flex rounded-full overflow-hidden h-2 gap-px bg-white/5">
                  {Array.from({ length: totalSets }).map((_, i) => (
                    <div key={i} className="flex gap-px" style={{ flex: setSeconds + (i < totalSets - 1 ? restSeconds : 0) }}>
                      <div className="bg-green-500/70" style={{ flex: setSeconds }} />
                      {i < totalSets - 1 && <div className="bg-yellow-400/60" style={{ flex: restSeconds }} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-gray-700 mt-1">
                  <span>🟢 Work ({fmtTime(setSeconds)}/set)</span>
                  <span>🟡 Rest ({restSeconds}s)</span>
                </div>
              </div>

              {/* Reps + Difficulty row */}
              <div className="flex gap-2 mb-5">
                {pkgConfig.reps && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm">
                    <RotateCcw className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-gray-300 font-semibold">{pkgConfig.reps} reps/set</span>
                  </div>
                )}
                {pkgConfig.difficulty && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${
                    pkgConfig.difficulty === 'advanced'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : pkgConfig.difficulty === 'intermediate'
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      : 'bg-green-500/10 border-green-500/20 text-green-400'
                  }`}>
                    <Flame className="w-3.5 h-3.5" />
                    {pkgConfig.difficulty}
                  </div>
                )}
              </div>
            </>
          ) : (
            // No pkgConfig — show beginner/intermed/advanced reps
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Beginner', value: exercise.beginnerReps,     color: 'text-green-400'  },
                { label: 'Intermed', value: exercise.intermediateReps, color: 'text-yellow-400' },
                { label: 'Advanced', value: exercise.advancedReps,     color: 'text-red-400'    },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                  <Flame className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="font-bold">{s.value || '—'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Coach notes */}
          {pkgConfig?.notes && (
            <div className="mb-5 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Coach Notes</p>
              <p className="text-gray-300 text-sm italic">"{pkgConfig.notes}"</p>
            </div>
          )}

          {/* START button */}
          <button
            onClick={startWorkout}
            className="w-full py-4 bg-green-500 text-black font-black text-xl rounded-2xl hover:bg-green-400 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-6"
          >
            <Play className="w-6 h-6 fill-black" />
            Start Workout
          </button>

          {/* Instructions */}
          {exercise.steps?.length > 0 && (
            <>
              <h3 className="text-xl font-bold mb-4">Instructions</h3>
              <ul className="space-y-3">
                {exercise.steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 font-bold flex items-center justify-center shrink-0 text-sm">
                      {i + 1}
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm">{step}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}