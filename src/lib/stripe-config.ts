// Stripe pricing configuration - safe to import client-side
// Does NOT import the Stripe SDK

export const PRICING = {
  monthly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
    amount: 39.99,
    credits: 100,
    interval: 'month' as const,
    name: 'Monthly Founder',
  },
  yearly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
    amount: 299.99,
    credits: 1200,
    interval: 'year' as const,
    name: 'Yearly Founder',
    savings: 179.89,
  },
};

