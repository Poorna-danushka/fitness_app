import { useState, useEffect } from 'react';
import { authAPI } from '../api/apiService';
import { User, Scale, Ruler, Calendar, Edit3, Check, X, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', weight: '', height: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getMe();
      const u = response.data.user;
      setUser(u);
      setFormData({ name: u.name, weight: u.weight || '', height: u.height || '' });
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
      });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ name: user?.name || '', weight: user?.weight || '', height: user?.height || '' });
  };

  const bmi = formData.weight && formData.height
    ? parseFloat((parseInt(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2)).toFixed(1))
    : null;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    if (bmi < 25) return { label: 'Healthy', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    return { label: 'Obese', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  const bmiCategory = bmi ? getBmiCategory(bmi) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your personal information and body metrics.</p>
      </div>

      {/* Toast message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
          {message.text}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Avatar + quick stats */}
        <div className="space-y-5">
          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface rounded-2xl p-6 text-center"
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-black font-bold text-4xl font-display mx-auto mb-4 glow-green">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-0.5">{user?.name}</h2>
            <p className="text-green-500 text-sm font-medium mb-4">Pro Member</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-white/[0.03] rounded-lg py-2">
              <Calendar className="w-3.5 h-3.5" />
              Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </div>
          </motion.div>

          {/* BMI Card */}
          {bmi && bmiCategory && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`card-surface rounded-2xl p-5 border ${bmiCategory.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400 font-medium">BMI Score</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bmiCategory.bg} ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </span>
              </div>
              <p className={`font-display text-5xl font-bold ${bmiCategory.color}`}>{bmi}</p>
              {/* BMI bar */}
              <div className="mt-4">
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500`}
                    style={{ width: `${Math.min(((bmi - 15) / 25) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-700">
                  <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Profile details / edit form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 card-surface rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-xl font-bold text-white">Personal Information</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-dark w-full pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="e.g. 75"
                      className="input-dark w-full pl-10"
                      min="30"
                      max="300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Height (cm)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="e.g. 175"
                      className="input-dark w-full pl-10"
                      min="100"
                      max="250"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-black py-3 rounded-xl font-bold hover:bg-green-400 disabled:opacity-60 transition-all glow-green"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/[0.05] border border-white/10 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-0">
              {[
                { label: 'Email Address', value: user?.email, icon: '✉' },
                { label: 'Full Name', value: user?.name, icon: '👤' },
                { label: 'Weight', value: user?.weight ? `${user.weight} kg` : null, icon: '⚖' },
                { label: 'Height', value: user?.height ? `${user.height} cm` : null, icon: '📏' },
              ].map((field, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-600 font-display mb-1">{field.label}</p>
                    <p className="text-white font-medium">{field.value || <span className="text-gray-600 italic text-sm">Not set</span>}</p>
                  </div>
                  <span className="text-xl opacity-30">{field.icon}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}