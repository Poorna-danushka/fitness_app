import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { packageAPI } from '../api/apiService';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentModal from '../components/PaymentModal';

// Initialize Stripe outside component to avoid recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function PackageList() {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll();
      setPackages(response.data.packages || []);
    } catch (error) {
      console.error('Error fetching packages', error);
    }
  };

  const handlePurchaseClick = (pkg: any) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    navigate('/my-package');
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="pb-12 text-white relative">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Select Your Plan</h1>
          <p className="text-gray-400">Upgrade your fitness journey with our curated, professional training packages designed for maximum results.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gray-900 rounded-3xl border border-gray-800 hover:border-green-500 flex flex-col overflow-hidden relative group shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="p-8 pb-0">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black">${pkg.price}</span>
                  <span className="text-gray-400 mb-1">/{pkg.duration}</span>
                </div>
                <p className="text-gray-400 text-sm h-12 line-clamp-2 mb-6">{pkg.description}</p>
              </div>

              <div className="flex-1 p-8 pt-0 flex flex-col">
                <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-gray-500">Includes:</h4>
                <div className="space-y-3 mb-8 flex-1">
                  {pkg.exercises?.map((ex: any) => (
                    <div key={ex._id} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <span className="text-gray-300 text-sm">{ex.name}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePurchaseClick(pkg)}
                  className="w-full py-4 rounded-xl font-bold bg-green-500 text-black hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] z-10"
                >
                  Purchase Plan
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {selectedPkg && (
          <PaymentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handlePaymentSuccess}
            packageId={selectedPkg._id}
            packageName={selectedPkg.name}
            price={selectedPkg.price}
          />
        )}
      </div>
    </Elements>
  );
}
