import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseAPI } from '../api/apiService';
import { motion } from 'framer-motion';
import { Search, Filter, Flame, Dumbbell, SlidersHorizontal, X } from 'lucide-react';

interface Exercise {
  _id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  caloriesPer10Min: number;
  description: string;
  image?: string;
}

const DIFFICULTY_COLORS = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  Intermediate: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  Advanced: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

const SkeletonCard = () => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
    <div className="h-40 bg-white/[0.04]" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-white/[0.06] rounded w-1/3" />
      <div className="h-5 bg-white/[0.06] rounded w-2/3" />
      <div className="h-3 bg-white/[0.06] rounded w-full" />
      <div className="h-3 bg-white/[0.06] rounded w-4/5" />
    </div>
  </div>
);

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await exerciseAPI.getAll();
      setExercises(response.data.exercises || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const muscleGroups = ['All', ...Array.from(new Set(exercises.map(e => e.muscleGroup))).sort()];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchDiff = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;
    return matchSearch && matchMuscle && matchDiff;
  });

  const activeFilters = (selectedMuscle !== 'All' ? 1 : 0) + (selectedDifficulty !== 'All' ? 1 : 0);

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">Exercise Library</h1>
        <p className="text-gray-500 text-sm">
          {loading ? 'Loading exercises...' : `${filtered.length} exercise${filtered.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Search by name or muscle group..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark w-full pl-10 pr-4"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
            showFilters || activeFilters > 0
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.07]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-green-500 text-black text-xs font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panels */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 card-surface rounded-2xl space-y-4"
        >
          {/* Muscle group */}
          <div>
            <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
              <Dumbbell className="w-3.5 h-3.5" /> Muscle Group
            </p>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selectedMuscle === m
                      ? 'bg-green-500/15 text-green-400 border-green-500/30'
                      : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> Difficulty
            </p>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(d => {
                const colors = d !== 'All' ? DIFFICULTY_COLORS[d as keyof typeof DIFFICULTY_COLORS] : null;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      selectedDifficulty === d
                        ? colors
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : 'bg-green-500/15 text-green-400 border-green-500/30'
                        : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:text-white hover:bg-white/[0.07]'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={() => { setSelectedMuscle('All'); setSelectedDifficulty('All'); }}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-gray-600" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-400 mb-2">No exercises found</h3>
          <p className="text-gray-600 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((exercise, i) => {
            const diff = exercise.difficulty as keyof typeof DIFFICULTY_COLORS;
            const colors = DIFFICULTY_COLORS[diff] || DIFFICULTY_COLORS.Beginner;

            return (
              <motion.div
                key={exercise._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                onClick={() => navigate(`/exercises/${exercise._id}`)}
                className="group bg-[#0d0d0d] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer hover:border-green-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(34,197,94,0.08)]"
              >
                {/* Image */}
                <div className="h-40 overflow-hidden relative bg-white/[0.03]">
                  {exercise.image ? (
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell className="w-10 h-10 text-gray-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-green-500 mb-1.5">{exercise.muscleGroup}</p>
                  <h3 className="font-display text-lg font-bold text-white mb-2 leading-tight group-hover:text-green-400 transition-colors">{exercise.name}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3">{exercise.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{exercise.caloriesPer10Min} kcal/10min</span>
                    </div>
                    <span className="text-[10px] text-gray-700">{exercise.equipment}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}