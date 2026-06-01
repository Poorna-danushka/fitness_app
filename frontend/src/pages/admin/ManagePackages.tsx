import { useState, useEffect } from 'react';
import { packageAPI } from '../../api/apiService';
import PackageForm from '../../components/PackageForm';
import { Trash2, Plus, Edit2, Package as PackageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagePackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageAPI.getAll();
      setPackages(response.data.packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedPackageId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedPackageId(id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await packageAPI.delete(id);
        setPackages(packages.filter(p => p._id !== id));
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Error deleting package');
      }
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    fetchPackages();
  };

  return (
    <div className="text-white">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <PackageIcon className="w-10 h-10 text-green-500" />
              Manage Packages
            </h1>
            <p className="text-gray-400">Create and manage fitness packages with exercises</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Create Package
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
          <p className="text-gray-400 mt-2">Loading packages...</p>
        </div>
      ) : (
        <>
          {packages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center"
            >
              <PackageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Packages Yet</h3>
              <p className="text-gray-400 mb-6">Create your first fitness package to get started</p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Package
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-green-500/30 p-6 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                      
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          ${pkg.price}/{pkg.duration}
                        </span>
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium capitalize">
                          {pkg.level}
                        </span>
                        <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                          {pkg.exercises?.length || 0} exercises
                        </span>
                        <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                          ~{pkg.totalDuration || 0} min
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(pkg._id)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Exercises list */}
                  {pkg.exercises && pkg.exercises.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs font-semibold text-gray-400 mb-2">EXERCISES:</p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {pkg.exercises.map((ex: any, idx: number) => (
                          <div key={ex._id} className="text-xs bg-gray-800 rounded p-2">
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-green-500 shrink-0">{idx + 1}.</span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-200">{ex.name}</p>
                                <p className="text-gray-500">{ex.packageConfig?.reps}</p>
                                <p className="text-gray-600">
                                  {ex.packageConfig?.sets}s × {ex.packageConfig?.duration}min
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {isFormOpen && (
        <PackageForm
          packageId={selectedPackageId || undefined}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
