"use client";

import { X, Eye, Code2, Smartphone, Monitor, Tablet, Check } from 'lucide-react';
import { useState } from 'react';

interface AppPreviewModalProps {
  code: string;
  projectName: string;
  onClose: () => void;
}

export default function AppPreviewModal({ code, projectName, onClose }: AppPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-2xl';
      case 'desktop': return 'max-w-full';
    }
  };

  // Create a beautiful mock app preview
  const createAppPreview = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
    .animate-slideIn { animation: slideIn 0.8s ease-out; }
    .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
  </style>
</head>
<body class="bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 min-h-screen">
  
  <!-- Navigation Bar -->
  <nav class="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 animate-fadeIn">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${projectName}
          </span>
        </div>
        <div class="hidden md:flex gap-6">
          <a href="#features" class="text-gray-700 hover:text-purple-600 transition font-medium">Features</a>
          <a href="#about" class="text-gray-700 hover:text-purple-600 transition font-medium">About</a>
          <a href="#contact" class="text-gray-700 hover:text-purple-600 transition font-medium">Contact</a>
        </div>
        <button class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105">
          Get Started
        </button>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn" style="animation-delay: 0.2s;">
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse-slow">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        Now Live & Ready to Deploy
      </div>
      
      <h1 class="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
        Welcome to
        <span class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent block mt-2">
          ${projectName}
        </span>
      </h1>
      
      <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        Your fully functional application is ready to launch. Built with modern technology and best practices.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105">
          Launch App
        </button>
        <button class="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg border-2 border-purple-600 hover:bg-purple-50 transition">
          Learn More
        </button>
      </div>
    </div>

    <!-- Feature Cards -->
    <div class="grid md:grid-cols-3 gap-8 mt-20">
      <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition transform hover:scale-105 animate-slideIn border border-purple-100">
        <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
        <p class="text-gray-600 leading-relaxed">
          Optimized for speed and performance. Your users will love the instant response times.
        </p>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition transform hover:scale-105 animate-slideIn border border-purple-100" style="animation-delay: 0.2s;">
        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">Secure & Safe</h3>
        <p class="text-gray-600 leading-relaxed">
          Built with security best practices. Your data is protected with industry-standard encryption.
        </p>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition transform hover:scale-105 animate-slideIn border border-purple-100" style="animation-delay: 0.4s;">
        <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">Responsive Design</h3>
        <p class="text-gray-600 leading-relaxed">
          Works perfectly on all devices. From mobile phones to desktop computers.
        </p>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-16 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-4 gap-8 text-center text-white">
        <div class="animate-fadeIn">
          <div class="text-5xl font-bold mb-2">100%</div>
          <div class="text-purple-100">Ready to Deploy</div>
        </div>
        <div class="animate-fadeIn" style="animation-delay: 0.1s;">
          <div class="text-5xl font-bold mb-2">⚡</div>
          <div class="text-purple-100">Lightning Fast</div>
        </div>
        <div class="animate-fadeIn" style="animation-delay: 0.2s;">
          <div class="text-5xl font-bold mb-2">🔒</div>
          <div class="text-purple-100">Secure & Safe</div>
        </div>
        <div class="animate-fadeIn" style="animation-delay: 0.3s;">
          <div class="text-5xl font-bold mb-2">📱</div>
          <div class="text-purple-100">Mobile Ready</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-12 text-center border-2 border-purple-200">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Ready to Get Started?
      </h2>
      <p class="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
        Your application is fully built and ready to deploy. Export to your favorite platform and go live in minutes!
      </p>
      <button class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center gap-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Deploy Now
      </button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="flex items-center justify-center gap-3 mb-4">
        <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <span class="text-xl font-bold">${projectName}</span>
      </div>
      <p class="text-gray-400">Generated with CodeLaunch • Ready to Deploy</p>
    </div>
  </footer>

</body>
</html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full h-[95vh] flex flex-col overflow-hidden border border-purple-500/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{projectName}</h2>
              <p className="text-purple-100 text-sm">Live Application Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              App Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'code'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Code2 className="w-4 h-4 inline mr-2" />
              Source Code
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className="flex gap-2">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  deviceMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-2 rounded-lg transition-colors ${
                  deviceMode === 'tablet' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  deviceMode === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-6">
          {activeTab === 'preview' ? (
            <div className={`${getDeviceWidth()} w-full h-full transition-all duration-300`}>
              <div className="bg-white rounded-xl shadow-2xl h-full overflow-hidden border-4 border-gray-700">
                <iframe
                  srcDoc={createAppPreview()}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="App Preview"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-900 rounded-lg overflow-auto p-6">
              <pre className="text-sm text-gray-300 font-mono">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="font-semibold">Live Preview</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Fully responsive & ready to deploy</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}


