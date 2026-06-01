import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, Filter } from 'lucide-react';

export default function ManageExercises() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', muscleGroup: '', description: '', image: '',
    beginnerReps: '', intermediateReps: '', advancedReps: '', instructions: ''
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await adminAPI.getAllExercises();
      setExercises(res.data.exercises || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        muscleGroup: formData.muscleGroup,
        description: formData.description,
        image: formData.image,
        beginnerReps: formData.beginnerReps,
        intermediateReps: formData.intermediateReps,
        advancedReps: formData.advancedReps,
        steps: formData.instructions.split('\n').filter(i => i.trim() !== '')
      };
      await adminAPI.createExercise(payload);
      setShowModal(false);
      setFormData({ name: '', muscleGroup: '', description: '', image: '', beginnerReps: '', intermediateReps: '', advancedReps: '', instructions: '' });
      fetchExercises();
    } catch (error) {
      console.error(error);
      alert('Error creating exercise');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this exercise?')) {
      try {
        await adminAPI.deleteExercise(id);
        fetchExercises();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="text-white space-y-8 pb-12">
      <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Exercises</h1>
          <p className="text-gray-400 text-sm">Build your comprehensive exercise library.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" /> Filter
          </button>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
          >
            <Plus className="w-5 h-5" /> Add Exercise
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {exercises.map((ex, i) => (
          <motion.div 
            key={ex._id} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group hover:border-green-500/50 transition-all"
          >
            <div className="h-40 overflow-hidden relative">
              <img src={ex.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'} alt={ex.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-black/50 backdrop-blur-md rounded hover:text-green-500"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(ex._id)} className="p-2 bg-black/50 backdrop-blur-md rounded text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-5">
              <span className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 block">{ex.muscleGroup}</span>
              <h3 className="text-lg font-bold mb-1">{ex.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{ex.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Exercise</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Exercise Name</label>
                  <input type="text" className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Muscle Group</label>
                  <input type="text" className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none" required value={formData.muscleGroup} onChange={e => setFormData({...formData, muscleGroup: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                <input type="url" className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none h-20" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Beginner Reps</label>
                  <input type="text" placeholder="e.g. 3x10" className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none" required value={formData.beginnerReps} onChange={e => setFormData({...formData, beginnerReps: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Intermediate Reps</label>
                  <input type="text" placeholder="e.g. 4x12" className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none" required value={formData.intermediateReps} onChange={e => setFormData({...formData, intermediateReps: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Advanced Reps</label>
                  <input type="text" placeholder="e.g. 5x15" className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none" required value={formData.advancedReps} onChange={e => setFormData({...formData, advancedReps: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Instructions (One per line)</label>
                <textarea className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none h-32" required value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}></textarea>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 bg-white/5 rounded-xl hover:bg-white/10 font-bold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-green-500 text-black rounded-xl font-bold hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">Save Exercise</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
