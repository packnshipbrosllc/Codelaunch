// Export Modal Component with Space Theme
// Location: src/components/ExportModal.tsx

'use client';

import { X, Download, Copy, Code, FileCode, Lock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  projectName: string;
  projectData?: any;
  codeContent?: any;
  featureName?: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  isSubscribed,
  projectName,
  projectData,
  codeContent,
  featureName,
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportToCursor = () => {
    if (!isSubscribed) {
      if (window.confirm('Export to Cursor is a Pro feature. Upgrade to unlock all export options.\n\nWould you like to view pricing?')) {
        window.location.href = '/#pricing';
      }
      return;
    }

    if (!codeContent) {
      alert('No code content available to export.');
      return;
    }

    setIsExporting(true);
    try {
      // Create a Cursor project file
      const cursorProject = {
        name: featureName || projectName,
        files: codeContent.files || codeContent,
        settings: {
          autoSave: true,
          formatOnSave: true,
        },
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(cursorProject, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(featureName || projectName).replace(/\s+/g, '-').toLowerCase()}.cursor`;
      a.click();
      URL.revokeObjectURL(url);

      alert('Cursor project file downloaded! Open it in Cursor to start coding.');
    } catch (error) {
      console.error('Export to Cursor failed:', error);
      alert('Failed to export to Cursor. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToVSCode = () => {
    if (!isSubscribed) {
      if (window.confirm('Export to VS Code is a Pro feature. Upgrade to unlock all export options.\n\nWould you like to view pricing?')) {
        window.location.href = '/#pricing';
      }
      return;
    }

    if (!codeContent) {
      alert('No code content available to export.');
      return;
    }

    setIsExporting(true);
    try {
      // Create VS Code workspace file
      const vscodeWorkspace = {
        folders: [
          {
            path: featureName || projectName,
          },
        ],
        settings: {
          'editor.formatOnSave': true,
          'editor.defaultFormatter': 'esbenp.prettier-vscode',
          'typescript.tsdk': 'node_modules/typescript/lib',
          'typescript.enablePromptUseWorkspaceTsdk': true,
        },
      };

      const blob = new Blob([JSON.stringify(vscodeWorkspace, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(featureName || projectName).replace(/\s+/g, '-').toLowerCase()}.code-workspace`;
      a.click();
      URL.revokeObjectURL(url);

      alert('VS Code workspace file downloaded! Open it in VS Code to start coding.');
    } catch (error) {
      console.error('Export to VS Code failed:', error);
      alert('Failed to export to VS Code. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!isSubscribed) {
      if (window.confirm('Download as ZIP is a Pro feature. Upgrade to unlock all export options.\n\nWould you like to view pricing?')) {
        window.location.href = '/#pricing';
      }
      return;
    }

    if (!codeContent) {
      alert('No code content available to export.');
      return;
    }

    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Add files to zip based on codeContent structure
      if (codeContent.files && Array.isArray(codeContent.files)) {
        // If structured as { files: [{ path, content }] }
        codeContent.files.forEach((file: any) => {
          zip.file(file.path, file.content || '');
        });
      } else if (typeof codeContent === 'object') {
        // If structured as { path: content }
        Object.entries(codeContent).forEach(([filepath, content]) => {
          zip.file(filepath, content as string);
        });
      }

      // Add README
      const readmeContent = `# ${featureName || projectName}

Generated by CodeLaunch

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Run database migrations (if applicable):
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

4. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure

${codeContent.structure ? JSON.stringify(codeContent.structure, null, 2) : 'See files above for structure.'}

## Dependencies

${codeContent.dependencies ? JSON.stringify(codeContent.dependencies, null, 2) : 'See package.json'}

---

Generated on ${new Date().toLocaleDateString()}
`;

      zip.file('README.md', readmeContent);

      // Add package.json if dependencies are provided
      if (codeContent.dependencies) {
        const packageJson = {
          name: (featureName || projectName).toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          description: `Generated by CodeLaunch for ${featureName || projectName}`,
          main: 'index.js',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint',
          },
          dependencies: codeContent.dependencies.npm?.reduce((acc: any, dep: string) => {
            const [name, version] = dep.split('@');
            acc[name] = version || 'latest';
            return acc;
          }, {}) || {},
          devDependencies: codeContent.dependencies.devDependencies?.reduce((acc: any, dep: string) => {
            const [name, version] = dep.split('@');
            acc[name] = version || 'latest';
            return acc;
          }, {}) || {},
        };
        zip.file('package.json', JSON.stringify(packageJson, null, 2));
      }

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${(featureName || projectName).replace(/\s+/g, '-').toLowerCase()}.zip`);

      alert('Project downloaded as ZIP! Extract and start coding.');
    } catch (error) {
      console.error('Download ZIP failed:', error);
      alert('Failed to create ZIP file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!isSubscribed) {
      if (window.confirm('Copy to Clipboard is a Pro feature. Upgrade to unlock all export options.\n\nWould you like to view pricing?')) {
        window.location.href = '/#pricing';
      }
      return;
    }

    if (!codeContent) {
      alert('No code content available to copy.');
      return;
    }

    setIsExporting(true);
    try {
      // Copy all code content as formatted text
      let allCode = '';

      if (codeContent.files && Array.isArray(codeContent.files)) {
        codeContent.files.forEach((file: any) => {
          allCode += `// ${file.path}\n${file.content || ''}\n\n`;
        });
      } else if (typeof codeContent === 'object') {
        Object.entries(codeContent).forEach(([filepath, content]) => {
          allCode += `// ${filepath}\n${content}\n\n`;
        });
      } else {
        allCode = codeContent;
      }

      await navigator.clipboard.writeText(allCode);

      alert('Code copied to clipboard! Paste it into your editor.');
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      alert('Failed to copy to clipboard. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (type: string) => {
    if (!isSubscribed) {
      if (window.confirm('Export features are available with Pro subscription. Upgrade to unlock:\n\n✅ Export to Cursor\n✅ Export to VS Code\n✅ Download as ZIP\n✅ Copy to Clipboard\n\nWould you like to view pricing?')) {
        window.location.href = '/#pricing';
      }
      return;
    }

    switch (type) {
      case 'cursor':
        handleExportToCursor();
        break;
      case 'vscode':
        handleExportToVSCode();
        break;
      case 'zip':
        handleDownloadZip();
        break;
      case 'clipboard':
        handleCopyToClipboard();
        break;
    }
  };

  const exportOptions = [
    {
      id: 'cursor',
      title: 'Export to Cursor',
      icon: Code,
      description: 'Open code directly in Cursor editor',
      color: 'purple',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      id: 'vscode',
      title: 'Export to VS Code',
      icon: FileCode,
      description: 'Open project in VS Code',
      color: 'pink',
      glow: 'shadow-pink-500/50',
      border: 'border-pink-500/30',
      hoverBorder: 'hover:border-pink-500',
      bg: 'bg-pink-500/10',
    },
    {
      id: 'zip',
      title: 'Download as ZIP',
      icon: Download,
      description: 'Complete project structure',
      color: 'blue',
      glow: 'shadow-blue-500/50',
      border: 'border-blue-500/30',
      hoverBorder: 'hover:border-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'clipboard',
      title: 'Copy to Clipboard',
      icon: Copy,
      description: 'Copy all code for manual use',
      color: 'green',
      glow: 'shadow-green-500/50',
      border: 'border-green-500/30',
      hoverBorder: 'hover:border-green-500',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-gradient-to-br from-gray-900 via-purple-900/90 to-black/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden">
          {/* Space Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
            {/* Animated stars */}
            {[...Array(30)].map((_, i) => (
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
          <div className="relative z-10">
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30 bg-gray-900/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
                    Export Project
                  </h2>
                  <p className="text-gray-300">{projectName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Export Options Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                const isLocked = !isSubscribed;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleExport(option.id)}
                    className={`relative group ${option.bg} backdrop-blur-sm ${option.border} ${option.hoverBorder} rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                      isLocked || isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${option.glow} shadow-lg`}
                    disabled={isExporting}
                  >
                    {/* Shimmer Effect */}
                    {!isLocked && (
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    )}

                    <div className="relative flex flex-col items-center gap-3">
                      {isLocked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-5 h-5 text-yellow-400" />
                        </div>
                      )}
                      <div className={`p-4 rounded-full ${option.bg} border ${option.border}`}>
                        <Icon className={`w-8 h-8 ${
                          option.color === 'purple' ? 'text-purple-400' :
                          option.color === 'pink' ? 'text-pink-400' :
                          option.color === 'blue' ? 'text-blue-400' :
                          'text-green-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Upgrade CTA for Free Users */}
            {!isSubscribed && (
              <div className="p-6 border-t border-purple-500/30 bg-gray-900/50">
                <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/50 rounded-xl p-6 shadow-lg shadow-purple-500/20">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-300 mb-4">
                      💎 Unlock all export options with Pro
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Export to Cursor
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Export to VS Code
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Download as ZIP
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Copy to Clipboard
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href = '/#pricing';
                      }}
                      className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                    >
                      Upgrade to Pro - $39.99/mo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

