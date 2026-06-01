import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentAPI, purchaseAPI } from '../api/apiService';
import { useNotification } from '../hooks/useUI';
import { Loader2, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageId: string;
  packageName: string;
  price: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  packageId,
  packageName,
  price,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { success } = useNotification();

  useEffect(() => {
    if (isOpen && packageId && price) {
      // Fetch payment intent from backend
      const fetchIntent = async () => {
        setInitializing(true);
        setError('');
        try {
          const res = await paymentAPI.createPaymentIntent(packageId, price);
          setClientSecret(res.data.data.clientSecret);
          setPaymentIntentId(res.data.data.paymentIntentId || res.data.data.paymentId); // Use explicit paymentIntentId when available
        } catch (err: any) {
          setError(err?.safeMessage || err?.message || 'Failed to initialize payment.');
        } finally {
          setInitializing(false);
        }
      };
      fetchIntent();
    }
  }, [isOpen, packageId, price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (clientSecret.startsWith('mock_secret_')) {
        // Simulate network delay for mock gateway
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await paymentAPI.confirmPayment(paymentIntentId);
        onSuccess();
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Notify backend to confirm payment and unlock package
        await paymentAPI.confirmPayment(paymentIntent.id);
        await purchaseAPI.createWithPayment(packageId, paymentIntent.id);
        success('Your purchase was completed successfully!');
        onSuccess();
      } else {
        throw new Error('Payment was not successful.');
      }
    } catch (err: any) {
      setError(err?.safeMessage || err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const CARD_OPTIONS = {
    style: {
      base: {
        color: '#fff',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Complete Purchase</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-end mb-6 bg-gray-800/50 p-4 rounded-xl">
              <div>
                <p className="text-sm text-gray-400 mb-1">Plan</p>
                <p className="font-semibold text-white">{packageName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-green-400">${price}</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {initializing ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-green-500" />
                <p>Initializing secure checkout...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Card Details</label>
                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
                    <CardElement options={CARD_OPTIONS} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 justify-center text-gray-500 text-xs">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <p>Payments are secure and encrypted by Stripe</p>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading || !clientSecret}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-black py-4 rounded-xl font-bold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${price}`
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
