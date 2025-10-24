import Link from 'next/link'
import { Rocket, Sparkles, Brain, FileText, Code, Zap } from 'lucide-react'

export default function HomePage() {
  const features = [
    { icon: Brain, text: 'AI Mindmap Creator', color: 'text-purple-400' },
    { icon: FileText, text: 'PRD Generator', color: 'text-blue-400' },
    { icon: Code, text: 'Code Generation', color: 'text-green-400' },
    { icon: Zap, text: 'Instant Deploy', color: 'text-yellow-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <Rocket className="w-24 h-24 text-blue-400 animate-bounce" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">CodeLaunch</span>
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Turn your ideas into fully functional apps with AI-powered development tools. 
          From concept to deployment in minutes.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-12">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
              <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
              <p className="text-white text-sm">{feature.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/sign-up"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-12 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-2 justify-center"
          >
            <Sparkles className="w-5 h-5" />
            Get Started
            <Sparkles className="w-5 h-5" />
          </Link>
          <Link 
            href="/sign-in"
            className="bg-white/10 backdrop-blur-sm text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20 flex items-center gap-2 justify-center"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account? <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
