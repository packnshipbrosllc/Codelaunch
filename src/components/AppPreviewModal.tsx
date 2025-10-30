"use client";

import { useMemo, useState } from 'react';
import { X, Smartphone, Tablet, Monitor, Maximize2, Code2, Eye } from 'lucide-react';

interface AppPreviewModalProps {
  code: string; // full HTML string or code artifact
  projectName: string;
  onClose: () => void;
}

export default function AppPreviewModal({ code, projectName, onClose }: AppPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const containerSize = useMemo(() => {
    if (device === 'mobile') return { width: 390, height: 800 };
    if (device === 'tablet') return { width: 820, height: 1180 };
    return { width: 1200, height: 800 };
  }, [device]);

  const srcDoc = useMemo(() => {
    // If code looks like a JSON artifact, try to extract html; otherwise treat as raw HTML
    try {
      const parsed = JSON.parse(code);
      if (parsed?.html) return String(parsed.html);
    } catch (_) {
      /* ignore */
    }
    return code;
  }, [code]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl max-w-[95vw] w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gray-950">
          <div>
            <h3 className="text-white font-semibold">App Preview</h3>
            <p className="text-gray-400 text-sm">{projectName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${activeTab === 'preview' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${activeTab === 'code' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Code2 className="w-4 h-4" /> Code
            </button>
            <button onClick={onClose} className="ml-2 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {activeTab === 'preview' && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-purple-500/20 bg-gray-900">
            <div className="flex items-center gap-2 text-gray-300">
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">Device</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDevice('mobile')}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${device === 'mobile' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                <Smartphone className="w-4 h-4" /> Mobile
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${device === 'tablet' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                <Tablet className="w-4 h-4" /> Tablet
              </button>
              <button
                onClick={() => setDevice('desktop')}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${device === 'desktop' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                <Monitor className="w-4 h-4" /> Desktop
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-hidden bg-gray-950">
          {activeTab === 'preview' ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <div
                className="bg-gray-900 border border-purple-500/20 rounded-xl shadow-2xl overflow-hidden"
                style={{ width: containerSize.width, height: containerSize.height }}
              >
                <iframe
                  title="App Preview"
                  className="w-full h-full bg-white"
                  srcDoc={srcDoc}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 overflow-auto max-h-[70vh] bg-gray-950">
              <pre className="text-sm text-gray-200 whitespace-pre-wrap">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Celebration footer */}
        <div className="bg-gray-900 px-6 py-4 border-t border-purple-500/20 flex items-center justify-between">
          <div className="text-gray-300 text-sm">🎉 Your app is ready! Toggle devices or view the code.</div>
          <button onClick={onClose} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


