// FILE PATH: src/components/AIAssistantChatEnhanced.tsx
// Enhanced AI Assistant Chat with keyboard shortcuts and better UX

'use client';

import { useState, useRef, useEffect } from 'react';
import { MindmapData } from '@/types/mindmap';

type ChatMode = 'explain' | 'suggest' | 'critique' | 'general';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantChatEnhancedProps {
  mindmapData: MindmapData;
  moodBoardImages?: string[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AIAssistantChatEnhanced({
  mindmapData,
  moodBoardImages = [],
  isCollapsed = false,
  onToggleCollapse,
}: AIAssistantChatEnhancedProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hi! I'm your AI assistant. I can help you understand your mindmap, suggest improvements, or answer questions about your project: **${mindmapData.projectName}**`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('general');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onToggleCollapse?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when mode changes or panel opens
  useEffect(() => {
    if (!isCollapsed) {
      inputRef.current?.focus();
      setHasNewMessage(false);
    }
  }, [mode, isCollapsed]);

  // Mark new message when collapsed
  useEffect(() => {
    if (isCollapsed && messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
      setHasNewMessage(true);
    }
  }, [messages, isCollapsed]);

  const modes = [
    { id: 'explain' as ChatMode, label: '💡 Explain', color: 'purple' },
    { id: 'suggest' as ChatMode, label: '✨ Suggest', color: 'blue' },
    { id: 'critique' as ChatMode, label: '🔍 Critique', color: 'orange' },
    { id: 'general' as ChatMode, label: '💬 General', color: 'pink' },
  ];

  const getModePrompt = (mode: ChatMode, userMessage: string) => {
    const context = `
Current Project: ${mindmapData.projectName}
Description: ${mindmapData.projectDescription}
Target Audience: ${mindmapData.targetAudience}
Features: ${mindmapData.features.map((f) => f.title).join(', ')}
Tech Stack: ${mindmapData.techStack.frontend}, ${mindmapData.techStack.backend}, ${mindmapData.techStack.database}
${moodBoardImages.length > 0 ? `\nMood Board: User has ${moodBoardImages.length} inspiration images uploaded` : ''}
`;

    const modeInstructions = {
      explain: 'You are in EXPLAIN mode. Help the user understand any aspect of their mindmap. Be clear, concise, and educational.',
      suggest: 'You are in SUGGEST mode. Provide creative ideas to improve or expand their project. Be innovative and constructive.',
      critique: 'You are in CRITIQUE mode. Provide honest, constructive feedback on their project structure, features, or approach. Be helpful but critical.',
      general: 'You are in GENERAL mode. Answer any questions about their project or provide general guidance.',
    };

    return `${modeInstructions[mode]}

${context}

User Question: ${userMessage}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: getModePrompt(mode, userMessage.content),
          mode,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: assistantMessage } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Collapsed state with new message indicator
  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-purple-600 to-purple-700 text-white px-3 py-8 rounded-l-xl shadow-2xl hover:from-purple-500 hover:to-purple-600 transition-all z-50 border-l-4 border-purple-400 ${
          hasNewMessage ? 'animate-pulse' : ''
        }`}
        title="Open AI Assistant (Cmd/Ctrl+K)"
      >
        <div className="flex flex-col items-center gap-2 relative">
          <span className="text-2xl">🤖</span>
          {hasNewMessage && (
            <span className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping" />
          )}
          <span className="text-xs font-semibold writing-mode-vertical">AI Assistant</span>
          {hasNewMessage && (
            <span className="text-[10px] bg-green-400 text-gray-900 px-1.5 py-0.5 rounded-full font-bold">
              New
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-gray-900/95 backdrop-blur-xl border-l border-purple-500/30 shadow-2xl flex flex-col z-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AI Assistant</h3>
            <p className="text-xs text-purple-100">Ask me anything!</p>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all group"
          title="Hide (Cmd/Ctrl+K)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="absolute right-16 top-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Cmd/Ctrl+K
          </span>
        </button>
      </div>

      {/* Mode Selector */}
      <div className="p-3 bg-gray-800/50 border-b border-gray-700/50">
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700/50">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your message (${mode} mode)...`}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg font-semibold"
          >
            {isLoading ? '...' : '📤'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line • Cmd/Ctrl+K to hide
        </p>
      </div>
    </div>
  );
}

