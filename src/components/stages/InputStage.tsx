import React from 'react';
import { Send, Lightbulb, ArrowLeft } from 'lucide-react';

interface InputStageProps {
  userInput: string;
  setUserInput: (input: string) => void;
  onSubmit: () => void;
  exampleIdeas: string[];
}

export default function InputStage({ userInput, setUserInput, onSubmit, exampleIdeas }: InputStageProps) {
  const handleExampleClick = (example: string) => {
    setUserInput(example);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            What's Your Idea?
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Describe your app idea and we'll help you build it. Be as specific or general as you'd like.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="idea" className="block text-white font-semibold mb-3">
                Describe your app idea
              </label>
              <textarea
                id="idea"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., A SaaS platform for therapists to manage appointments and client notes with secure messaging..."
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {userInput.length} characters
              </div>
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Generate App
              </button>
            </div>
          </form>
        </div>

        {/* Example Ideas */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Need inspiration?</h3>
          </div>
          
          <div className="space-y-4">
            {exampleIdeas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(idea)}
                className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all transform hover:scale-[1.02] group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white group-hover:text-blue-300 transition-colors">
                      {idea}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
