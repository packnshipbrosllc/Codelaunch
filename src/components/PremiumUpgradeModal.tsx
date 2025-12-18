'use client';

import { useState } from 'react';
import { X, Check, Database, Code, FileText, Download, Zap, Server } from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  trigger: 'free_limit' | 'prd_locked' | 'code_locked';
}

const samplePRD = {
  featureName: "User Authentication",
  overview: "Secure user authentication system with email/password login, OAuth providers, and session management.",
  userStories: [
    {
      persona: "New User",
      story: "As a new user, I want to create an account with my email so I can access the app securely",
      acceptanceCriteria: [
        "Email validation with error messages",
        "Password strength requirements displayed",
        "Confirmation email sent after signup"
      ]
    },
    {
      persona: "Returning User", 
      story: "As a returning user, I want to login quickly with Google so I don't have to remember passwords",
      acceptanceCriteria: [
        "Google OAuth button on login page",
        "Account linking if email exists",
        "Redirect to dashboard after login"
      ]
    }
  ],
  technicalRequirements: {
    database: {
      tables: [
        {
          tableName: "users",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL" },
            { name: "password_hash", type: "VARCHAR(255)", constraints: "" },
            { name: "oauth_provider", type: "VARCHAR(50)", constraints: "" },
            { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()" }
          ]
        },
        {
          tableName: "sessions",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id)" },
            { name: "token", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL" },
            { name: "expires_at", type: "TIMESTAMP", constraints: "NOT NULL" }
          ]
        }
      ]
    },
    apiEndpoints: [
      { method: "POST", path: "/api/auth/signup", description: "Create new user account" },
      { method: "POST", path: "/api/auth/login", description: "Authenticate user and create session" },
      { method: "POST", path: "/api/auth/oauth/google", description: "Handle Google OAuth callback" },
      { method: "DELETE", path: "/api/auth/logout", description: "Invalidate session and logout" }
    ]
  }
};

const sampleCode = `// components/AuthForm.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg">
        Sign In
      </button>
      <button type="button" onClick={loginWithGoogle} className="w-full border py-2 rounded-lg">
        Continue with Google
      </button>
    </form>
  );
}`;

export default function PremiumUpgradeModal({ isOpen, onClose, onUpgrade, trigger }: PremiumUpgradeModalProps) {
  const [activeTab, setActiveTab] = useState<'prd' | 'code'>('prd');

  if (!isOpen) return null;

  const headlines = {
    free_limit: "You've Used All 3 Free Mindmaps!",
    prd_locked: "PRD Generation is a Pro Feature",
    code_locked: "Code Generation is a Pro Feature"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Left side - Value prop */}
          <div className="lg:w-1/2 p-8 bg-gradient-to-br from-purple-900/50 to-gray-900">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-purple-600/30 text-purple-300 text-sm rounded-full mb-4">
                PRO
              </span>
              <h2 className="text-2xl font-bold text-white mb-2">
                {headlines[trigger]}
              </h2>
              <p className="text-gray-400">
                Upgrade to unlock the full power of CodeLaunch
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Unlimited Mindmaps</p>
                  <p className="text-gray-400 text-sm">Generate as many project roadmaps as you need</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Detailed PRD Generation</p>
                  <p className="text-gray-400 text-sm">User stories, database schemas, API endpoints</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Production-Ready Code</p>
                  <p className="text-gray-400 text-sm">React components, TypeScript, API routes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Export Anywhere</p>
                  <p className="text-gray-400 text-sm">Cursor, VS Code, or download as ZIP</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">$39.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Cancel anytime. No questions asked.</p>
              
              <button
                onClick={onUpgrade}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Upgrade to Pro
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">J</div>
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white text-xs">M</div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">A</div>
              </div>
              <span>Joined by 50+ developers this week</span>
            </div>
          </div>

          {/* Right side - Sample PRD/Code preview */}
          <div className="lg:w-1/2 p-6 bg-gray-950 border-l border-gray-800">
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-3">See what you'll get:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('prd')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'prd' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Sample PRD
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'code' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Sample Code
                </button>
              </div>
            </div>

            {/* Preview content */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[400px] overflow-y-auto">
              {activeTab === 'prd' ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {samplePRD.featureName}
                    </h3>
                    <p className="text-gray-300">{samplePRD.overview}</p>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">User Stories</h4>
                    {samplePRD.userStories.map((story, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg p-3 mb-2">
                        <p className="text-purple-300 text-xs mb-1">{story.persona}</p>
                        <p className="text-gray-300 text-sm mb-2">{story.story}</p>
                        <ul className="space-y-1">
                          {story.acceptanceCriteria.map((criteria, j) => (
                            <li key={j} className="text-gray-400 text-xs flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-400" />
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Database Schema
                    </h4>
                    {samplePRD.technicalRequirements.database.tables.map((table, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg p-3 mb-2">
                        <p className="text-green-400 font-mono text-sm mb-2">{table.tableName}</p>
                        <div className="space-y-1">
                          {table.columns.map((col, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs">
                              <span className="text-purple-300 font-mono">{col.name}</span>
                              <span className="text-gray-500">{col.type}</span>
                              {col.constraints && (
                                <span className="text-yellow-400/70">{col.constraints}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      API Endpoints
                    </h4>
                    <div className="space-y-2">
                      {samplePRD.technicalRequirements.apiEndpoints.map((endpoint, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded font-mono ${
                            endpoint.method === 'POST' ? 'bg-green-600/20 text-green-400' :
                            endpoint.method === 'DELETE' ? 'bg-red-600/20 text-red-400' :
                            'bg-blue-600/20 text-blue-400'
                          }`}>
                            {endpoint.method}
                          </span>
                          <span className="text-gray-300 font-mono">{endpoint.path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    <code>{sampleCode}</code>
                  </pre>
                </div>
              )}
            </div>

            <p className="text-gray-500 text-xs mt-3 text-center">
              ↑ This is a sample. Your PRDs will be customized to your app idea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

