import apiClient from './apiClient';

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentId: string;
  };
}

export interface SubscriptionData {
  packageId: string;
  planId: string;
  billingCycle?: 'monthly' | 'yearly';
}

export interface PaymentHistory {
  payments: Array<{
    _id: string;
    amount: number;
    status: string;
    createdAt: string;
    description: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    pages: number;
  };
}

export interface Subscription {
  _id: string;
  packageId: {
    name: string;
    price: number;
    duration: string;
    description: string;
  };
  status: string;
  nextBillingDate: string;
  amount: number;
  billingCycle: string;
}

/**
 * Create payment intent for one-time purchase
 */
export const createPaymentIntent = (
  packageId: string,
  amount: number
): Promise<PaymentIntentResponse> => {
  return apiClient.post('/payments/intent', { packageId, amount });
};

/**
 * Create subscription
 */
export const createSubscription = (data: SubscriptionData): Promise<any> => {
  return apiClient.post('/payments/subscribe', data);
};

/**
 * Cancel subscription
 */
export const cancelSubscription = (reason?: string): Promise<any> => {
  return apiClient.post('/payments/cancel', { reason });
};

/**
 * Get payment history
 */
export const getPaymentHistory = (
  limit: number = 10,
  skip: number = 0
): Promise<PaymentHistory> => {
  return apiClient.get('/payments/history', { limit, skip });
};

/**
 * Get subscription details
 */
export const getSubscriptionDetails = (): Promise<{ success: boolean; data: Subscription }> => {
  return apiClient.get('/payments/subscription');
};
