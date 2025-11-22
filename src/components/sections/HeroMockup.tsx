// Hero Mockup Component - Split View Chat + Code Preview
// Location: src/components/sections/HeroMockup.tsx

'use client';

import { useState, useEffect } from 'react';
import { User, Bot, Send, Sparkles } from 'lucide-react';

export default function HeroMockup() {
  const [isTyping, setIsTyping] = useState(true);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [showCode, setShowCode] = useState(false);

  // Simulate typing animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
      setShowCode(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate code appearing line by line
  useEffect(() => {
    if (!showCode) return;

    const fullCode = `import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InvoiceList from '@/components/invoices/list';

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      <InvoiceList invoices={invoices} />
    </div>
  );
}`;

    const lines = fullCode.split('\n');
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < lines.length) {
        setCodeLines(lines.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 80); // Slightly faster for better UX

    return () => clearInterval(interval);
  }, [showCode]);

  return (
    <div className="relative mt-16 mx-auto max-w-6xl">
      {/* Purple gradient glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
      
      {/* Browser window */}
      <div className="relative bg-gray-900 rounded-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
        {/* Browser header with dots */}
        <div className="h-12 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center px-4 gap-3 border-b border-purple-500/20">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70 shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/70 shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/70 shadow-sm"></div>
          </div>
          
          {/* URL bar */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-gray-950/50 border border-purple-500/20 rounded-lg px-4 py-1.5 max-w-md w-full">
              <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              </div>
              <span className="text-xs text-gray-400 font-mono flex-1 text-center">
                codelaunch.ai/dashboard
              </span>
              <Sparkles className="w-3 h-3 text-purple-400" />
            </div>
          </div>
        </div>
        
        {/* Split view content */}
        <div className="grid md:grid-cols-2 h-[400px] md:h-[500px] bg-gray-950">
          {/* Left: Chat interface */}
          <div className="p-6 border-r border-purple-500/20 flex flex-col bg-gray-900/50 backdrop-blur-sm">
            {/* Chat messages */}
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
              {/* User message */}
              <div className="flex gap-3 animate-[fadeUp_0.5s_ease-out]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30 flex-shrink-0">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <div className="bg-gray-800/80 backdrop-blur-sm border border-purple-500/20 rounded-lg rounded-tl-none p-4 text-sm text-gray-300 max-w-[85%] shadow-lg">
                  <p>I need a SaaS for freelance designers to manage clients, send invoices, and track project deadlines. Include Stripe payments and email notifications.</p>
                </div>
              </div>
              
              {/* AI response */}
              <div className="flex gap-3 flex-row-reverse animate-[fadeUp_0.5s_ease-out_0.3s_both]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center border border-pink-500/30 flex-shrink-0">
                  <Bot className="w-4 h-4 text-pink-400" />
                </div>
                <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg rounded-tr-none p-4 text-sm text-gray-300 max-w-[85%] shadow-lg backdrop-blur-sm">
                  <p className="mb-3 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Generating Architecture...
                  </p>
                  <ul className="space-y-2 text-gray-400 text-xs mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Database Schema: Users, Clients, Invoices, Projects tables</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Auth: Clerk with magic link & OAuth configured</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Pages: /dashboard, /clients, /invoices/[id], /projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>API Routes: Stripe webhooks, email notifications ready</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Components: Invoice generator, deadline calendar, client portal</span>
                    </li>
                  </ul>
                  <button className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                    View Mindmap & PRD
                  </button>
                </div>
              </div>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 flex-row-reverse animate-[fadeUp_0.5s_ease-out]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center border border-pink-500/30 flex-shrink-0">
                    <Bot className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="bg-gray-800/50 border border-purple-500/20 rounded-lg rounded-tr-none p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="mt-4 relative">
              <input 
                type="text" 
                placeholder="Refine your idea..." 
                className="w-full bg-gray-950/80 backdrop-blur-sm border border-purple-500/30 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500"
                readOnly
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-lg hover:bg-purple-500/10">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Right: Code preview */}
          <div className="bg-[#0d1117] p-6 font-mono text-xs overflow-hidden hidden md:block relative">
            {/* Purple tint overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/10 to-transparent pointer-events-none"></div>
            
            {/* File header */}
            <div className="flex justify-between items-center text-gray-500 mb-4 border-b border-gray-800 pb-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-gray-400">/app/dashboard/page.tsx</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-[10px]">✓ Generated</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              </div>
            </div>
            
            {/* Code with syntax highlighting */}
            <div className="relative z-10 overflow-y-auto h-full custom-scrollbar">
              <pre className="text-gray-300 leading-relaxed">
                {codeLines.map((line, idx) => {
                  // Syntax highlighting
                  const isImport = line.trim().startsWith('import');
                  const isExport = line.trim().startsWith('export');
                  const isFunction = line.includes('function') || line.includes('const') || line.includes('async');
                  const isString = line.includes("'") || line.includes('"');
                  const isComment = line.trim().startsWith('//');
                  const isJSX = line.includes('<') || line.includes('>');
                  
                  let className = 'text-gray-300';
                  if (isImport || isExport) className = 'text-purple-400';
                  else if (isFunction) className = 'text-blue-400';
                  else if (isString) className = 'text-green-400';
                  else if (isComment) className = 'text-gray-600';
                  else if (isJSX) className = 'text-pink-400';
                  
                  return (
                    <div key={idx} className={className} style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}>
                      {line || '\u00A0'}
                    </div>
                  );
                })}
                {showCode && codeLines.length > 0 && (
                  <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Show code preview link */}
      <div className="md:hidden mt-4 text-center">
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 mx-auto">
          <span>Tap to see generated code</span>
          <span>→</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.4); 
          }
        }
      `}</style>
    </div>
  );
}

