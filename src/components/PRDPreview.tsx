// PRD Preview Component with Space Theme
// Location: src/components/PRDPreview.tsx

'use client';

import { X, Lock, CheckCircle2, Code, Database, Package, Rocket, Users, Zap, FileText } from 'lucide-react';
import { EnhancedFeature } from '@/types/enhanced-mindmap';

interface PRDPreviewProps {
  feature: EnhancedFeature;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

// Generate realistic PRD content based on feature
function generatePRDPreview(feature: EnhancedFeature) {
  const featureName = feature.title.toLowerCase();
  const isAuth = featureName.includes('auth') || featureName.includes('login') || featureName.includes('sign');
  const isPayment = featureName.includes('payment') || featureName.includes('stripe') || featureName.includes('billing');
  const isData = featureName.includes('data') || featureName.includes('analytics') || featureName.includes('dashboard');

  // User Stories
  const userStories = isAuth
    ? [
        "As a new user, I want to create an account with my email and password so that I can access the platform securely.",
        "As a returning user, I want to log in with my credentials so that I can access my personalized dashboard.",
        "As a user, I want to reset my password via email if I forget it so that I can regain access to my account.",
        "As a user, I want to log out securely so that my session is properly terminated.",
        "As a user, I want my session to persist across browser refreshes so that I don't have to log in repeatedly.",
      ]
    : isPayment
    ? [
        "As a customer, I want to securely enter my payment information so that I can complete a purchase.",
        "As a customer, I want to see a clear breakdown of charges before confirming payment so that I understand what I'm paying for.",
        "As a customer, I want to receive a receipt via email after payment so that I have a record of my transaction.",
        "As a business owner, I want to process refunds when needed so that I can maintain customer satisfaction.",
        "As a business owner, I want to view payment history and analytics so that I can track revenue.",
      ]
    : [
        `As a user, I want to ${feature.description.toLowerCase()} so that I can accomplish my goals efficiently.`,
        `As a user, I want to access ${feature.title.toLowerCase()} from any device so that I can use it when needed.`,
        `As a user, I want my ${feature.title.toLowerCase()} data to be saved automatically so that I don't lose work.`,
        `As a user, I want to see clear feedback when using ${feature.title.toLowerCase()} so that I understand what's happening.`,
        `As a user, I want ${feature.title.toLowerCase()} to work quickly so that I don't experience delays.`,
      ];

  // API Endpoints
  const apiEndpoints = isAuth
    ? [
        {
          method: 'POST',
          path: '/api/auth/signup',
          description: 'Create a new user account',
          request: {
            body: { email: 'string', password: 'string', name: 'string' },
          },
          response: {
            success: { user: { id: 'uuid', email: 'string' }, token: 'jwt' },
            error: { message: 'string' },
          },
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Authenticate user and return session token',
          request: {
            body: { email: 'string', password: 'string' },
          },
          response: {
            success: { user: { id: 'uuid', email: 'string' }, token: 'jwt' },
            error: { message: 'Invalid credentials' },
          },
        },
        {
          method: 'POST',
          path: '/api/auth/logout',
          description: 'Terminate user session',
          request: {
            headers: { Authorization: 'Bearer <token>' },
          },
          response: { success: { message: 'Logged out successfully' } },
        },
      ]
    : isPayment
    ? [
        {
          method: 'POST',
          path: '/api/payments/create-intent',
          description: 'Create payment intent for checkout',
          request: {
            body: { amount: 'number', currency: 'string', customerId: 'uuid' },
          },
          response: {
            success: { clientSecret: 'string', intentId: 'string' },
            error: { message: 'string' },
          },
        },
        {
          method: 'POST',
          path: '/api/payments/confirm',
          description: 'Confirm payment and process transaction',
          request: {
            body: { intentId: 'string', paymentMethodId: 'string' },
          },
          response: {
            success: { transactionId: 'string', status: 'succeeded' },
            error: { message: 'Payment failed' },
          },
        },
        {
          method: 'POST',
          path: '/api/webhooks/stripe',
          description: 'Handle Stripe webhook events',
          request: {
            body: { type: 'string', data: 'object' },
            headers: { 'stripe-signature': 'string' },
          },
          response: { success: { received: true } },
        },
      ]
    : [
        {
          method: 'GET',
          path: `/api/${featureName.replace(/\s+/g, '-')}`,
          description: `Retrieve all ${feature.title.toLowerCase()} items`,
          request: {
            headers: { Authorization: 'Bearer <token>' },
            query: { page: 'number', limit: 'number' },
          },
          response: {
            success: { data: 'array', pagination: 'object' },
            error: { message: 'string' },
          },
        },
        {
          method: 'POST',
          path: `/api/${featureName.replace(/\s+/g, '-')}`,
          description: `Create a new ${feature.title.toLowerCase()} item`,
          request: {
            body: { /* feature-specific fields */ },
            headers: { Authorization: 'Bearer <token>' },
          },
          response: {
            success: { id: 'uuid', /* created data */ },
            error: { message: 'Validation failed' },
          },
        },
        {
          method: 'PUT',
          path: `/api/${featureName.replace(/\s+/g, '-')}/:id`,
          description: `Update an existing ${feature.title.toLowerCase()} item`,
          request: {
            body: { /* updated fields */ },
            headers: { Authorization: 'Bearer <token>' },
          },
          response: {
            success: { /* updated data */ },
            error: { message: 'Not found' },
          },
        },
      ];

  // Database Schema
  const databaseSchema = isAuth
    ? {
        tableName: 'users',
        columns: [
          { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY, DEFAULT gen_random_uuid()' },
          { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL' },
          { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
          { name: 'name', type: 'VARCHAR(255)', constraints: 'NULL' },
          { name: 'email_verified', type: 'BOOLEAN', constraints: 'DEFAULT false' },
          { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
          { name: 'updated_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
        ],
      }
    : isPayment
    ? {
        tableName: 'payments',
        columns: [
          { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY' },
          { name: 'user_id', type: 'UUID', constraints: 'REFERENCES users(id)' },
          { name: 'amount', type: 'DECIMAL(10,2)', constraints: 'NOT NULL' },
          { name: 'currency', type: 'VARCHAR(3)', constraints: "DEFAULT 'USD'" },
          { name: 'status', type: 'VARCHAR(50)', constraints: "DEFAULT 'pending'" },
          { name: 'stripe_intent_id', type: 'VARCHAR(255)', constraints: 'UNIQUE' },
          { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
        ],
      }
    : {
        tableName: featureName.replace(/\s+/g, '_'),
        columns: [
          { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY' },
          { name: 'user_id', type: 'UUID', constraints: 'REFERENCES users(id)' },
          { name: 'title', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
          { name: 'data', type: 'JSONB', constraints: 'NULL' },
          { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
          { name: 'updated_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
        ],
      };

  // UI Components
  const uiComponents = isAuth
    ? [
        'SignUpForm.tsx - Email/password signup form with validation',
        'LoginForm.tsx - Email/password login form',
        'PasswordResetForm.tsx - Password reset request form',
        'AuthGuard.tsx - HOC for protecting authenticated routes',
        'SessionProvider.tsx - Context provider for session management',
      ]
    : isPayment
    ? [
        'CheckoutForm.tsx - Payment form with Stripe Elements',
        'PaymentMethodSelector.tsx - Choose payment method',
        'InvoiceList.tsx - Display payment history',
        'SubscriptionStatus.tsx - Show current subscription',
        'BillingSettings.tsx - Manage billing information',
      ]
    : [
        `${feature.title.replace(/\s+/g, '')}List.tsx - Display list of items`,
        `${feature.title.replace(/\s+/g, '')}Form.tsx - Create/edit form`,
        `${feature.title.replace(/\s+/g, '')}Card.tsx - Individual item card`,
        `${feature.title.replace(/\s+/g, '')}Modal.tsx - Detail view modal`,
      ];

  // Dependencies
  const dependencies = isAuth
    ? [
        '@clerk/nextjs - Authentication service',
        'bcryptjs - Password hashing',
        'jsonwebtoken - JWT token generation',
        'zod - Input validation',
      ]
    : isPayment
    ? [
        'stripe - Payment processing',
        '@stripe/stripe-js - Stripe client library',
        '@stripe/react-stripe-js - React Stripe components',
        'zod - Payment data validation',
      ]
    : [
        'react-hook-form - Form management',
        'zod - Schema validation',
        'axios - HTTP client',
        'date-fns - Date formatting',
      ];

  // Implementation Steps
  const implementationSteps = [
    `Design database schema for ${feature.title.toLowerCase()}`,
    `Create API endpoints for ${feature.title.toLowerCase()} CRUD operations`,
    `Implement authentication/authorization middleware`,
    `Build React components for ${feature.title.toLowerCase()} UI`,
    `Add form validation and error handling`,
    `Implement real-time updates if needed`,
    `Write unit and integration tests`,
    `Add monitoring and logging`,
    `Deploy to production environment`,
  ];

  return {
    userStories,
    apiEndpoints,
    databaseSchema,
    uiComponents,
    dependencies,
    implementationSteps,
  };
}

export default function PRDPreview({ feature, isOpen, onClose, onUpgrade }: PRDPreviewProps) {
  if (!isOpen) return null;

  const prdContent = generatePRDPreview(feature);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-purple-900/90 to-black/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden">
          {/* Space Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
            {/* Animated stars */}
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30 bg-gray-900/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-purple-300 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Product Requirement Document (Preview)
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* User Stories */}
              <section className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  👤 User Stories
                </h3>
                <div className="space-y-3">
                  {prdContent.userStories.map((story, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/10">
                      <p className="text-gray-300 leading-relaxed">
                        <span className="text-purple-400 font-semibold">{idx + 1}.</span> {story}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Technical Requirements */}
              <section className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-400" />
                  ⚙️ Technical Requirements
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>• RESTful API design with proper HTTP methods</p>
                  <p>• Input validation using Zod schemas</p>
                  <p>• Error handling with consistent error responses</p>
                  <p>• Authentication middleware for protected routes</p>
                  <p>• Database transactions for data integrity</p>
                  <p>• Rate limiting to prevent abuse</p>
                </div>
              </section>

              {/* API Endpoints */}
              <section className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center gap-2">
                  <Code className="w-6 h-6 text-purple-400" />
                  🔌 API Endpoints
                </h3>
                <div className="space-y-4">
                  {prdContent.apiEndpoints.map((endpoint, idx) => (
                    <div key={idx} className="bg-gray-900/70 p-4 rounded-lg border border-purple-500/10">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded font-mono text-sm font-bold ${
                            endpoint.method === 'GET'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                              : endpoint.method === 'POST'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                              : endpoint.method === 'PUT'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                              : 'bg-red-500/20 text-red-400 border border-red-500/50'
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-purple-300 font-mono text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{endpoint.description}</p>
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-gray-500">Request:</div>
                        <pre className="bg-black/50 p-3 rounded text-xs text-gray-300 overflow-x-auto border border-gray-700">
                          {JSON.stringify(endpoint.request, null, 2)}
                        </pre>
                        <div className="text-xs text-gray-500 mt-2">Response:</div>
                        <pre className="bg-black/50 p-3 rounded text-xs text-gray-300 overflow-x-auto border border-gray-700">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Database Schema */}
              <section className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center gap-2">
                  <Database className="w-6 h-6 text-purple-400" />
                  💾 Database Schema
                </h3>
                <div className="bg-gray-900/70 p-4 rounded-lg border border-purple-500/10">
                  <div className="text-purple-300 font-mono font-semibold mb-3">
                    Table: {prdContent.databaseSchema.tableName}
                  </div>
                  <div className="space-y-2">
                    {prdContent.databaseSchema.columns.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-sm">
                        <code className="text-purple-400 font-mono w-32">{col.name}</code>
                        <code className="text-blue-400 font-mono w-32">{col.type}</code>
                        <span className="text-gray-400 text-xs">{col.constraints}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* UI Components */}
              <section className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center gap-2">
                  <Code className="w-6 h-6 text-purple-400" />
                  🎨 UI Components
                </h3>
                <div className="space-y-2">
                  {prdContent.uiComponents.map((component, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-3 rounded border border-purple-500/10">
                      <code className="text-purple-300 font-mono text-sm">{component}</code>
                    </div>
                  ))}
                </div>
              </section>

              {/* Dependencies */}
              <section className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-400" />
                  📦 Dependencies
                </h3>
                <div className="space-y-2">
                  {prdContent.dependencies.map((dep, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-3 rounded border border-purple-500/10">
                      <code className="text-purple-300 font-mono text-sm">{dep}</code>
                    </div>
                  ))}
                </div>
              </section>

              {/* Implementation Steps */}
              <section className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  🚀 Implementation Steps
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  {prdContent.implementationSteps.map((step, idx) => (
                    <li key={idx} className="text-gray-300 pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* Sticky Footer with Upgrade CTA */}
            <div className="sticky bottom-0 p-6 bg-gray-900/90 backdrop-blur-xl border-t-2 border-gradient-to-r from-purple-500 to-pink-500">
              <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/50 rounded-xl p-6 shadow-lg shadow-purple-500/20">
                <div className="text-center mb-4">
                  <p className="text-lg font-semibold text-purple-300 mb-2">
                    💎 This is a preview. Upgrade to Pro for:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      Full PRDs for every feature
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      AI code generation
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      Export to Cursor/VS Code
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      Unlimited projects
                    </div>
                  </div>
                  <button
                    onClick={onUpgrade}
                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                  >
                    Upgrade to Pro - $39.99/mo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

