import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotification } from '../hooks/useUI';

interface Package {
  _id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

export const Pricing: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const { info } = useNotification();

  useEffect(() => {
    // Mock data - replace with API call
    const mockPackages: Package[] = [
      {
        _id: '1',
        name: 'Basic',
        price: 9.99,
        duration: '1 month',
        description: 'Get started with fitness tracking',
      },
      {
        _id: '2',
        name: 'Pro',
        price: 24.99,
        duration: '3 months',
        description: 'Advanced features and priority support',
      },
      {
        _id: '3',
        name: 'Premium',
        price: 79.99,
        duration: '1 year',
        description: 'Complete fitness suite with all features',
      },
    ];
    setPackages(mockPackages);
    setLoading(false);
  }, []);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    info('Redirecting to checkout...');
    // TODO: Redirect to checkout with selected package
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading pricing plans..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your fitness journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 ${
                selectedPackage === pkg._id ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-6">{pkg.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">${pkg.price}</span>
                  <span className="text-gray-600 ml-2">/ {pkg.duration}</span>
                </div>

                <button
                  onClick={() => handleSelectPackage(pkg._id)}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition mb-8"
                >
                  Get Started
                </button>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited workouts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Progress tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Exercise library</span>
                  </div>
                  {pkg._id !== '1' && (
                    <>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Priority support</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Advanced analytics</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Money-back guarantee</h4>
              <p className="text-gray-700">
                Not satisfied? Get a full refund within 30 days. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
