"use client";

import { X } from 'lucide-react';

interface CodePreviewModalProps {
  code: string;
  projectName: string;
  onClose: () => void;
}

export default function CodePreviewModal({ code, projectName, onClose }: CodePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gray-950">
          <div>
            <h3 className="text-white font-semibold">Code Preview</h3>
            <p className="text-gray-400 text-sm">{projectName}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[70vh] bg-gray-950">
          <pre className="text-sm text-gray-200 whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-purple-500/20 bg-gray-950">
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Copy
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
