import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

export const PRICING = {
  monthly: {
    amount: 3999, // $39.99
    currency: 'usd',
    interval: 'month',
  },
  yearly: {
    amount: 29999, // $299.99
    currency: 'usd',
    interval: 'year',
  },
} as const;

export { stripe };

