// src/components/PRDViewer.tsx
'use client';

import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface PRDViewerProps {
  prdData: any;
  projectName: string;
  onClose?: () => void;
}

export default function PRDViewer({ prdData, projectName, onClose }: PRDViewerProps) {
  const [activeSection, setActiveSection] = useState<string>('all');
  
  const sections = prdData?.sections || {};
  const sectionKeys = Object.keys(sections);

  const exportToDOCX = async () => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: `Product Requirements Document`,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: projectName,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: `Generated: ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Sections
            ...sectionKeys.flatMap(key => {
              const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const content = sections[key];
              
              return [
                new Paragraph({
                  text: title,
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                  text: content,
                  spacing: { after: 200 },
                }),
              ];
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${projectName}-PRD.docx`);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      alert('Failed to export PRD. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{projectName}</h2>
              <p className="text-purple-100 text-sm">Product Requirements Document</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToDOCX}
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                📄 Export as DOCX
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
                >
                  ✕ Close
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r bg-gray-50 overflow-y-auto p-4">
            <button
              onClick={() => setActiveSection('all')}
              className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
                activeSection === 'all'
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              📋 All Sections
            </button>
            
            {sectionKeys.map((key) => {
              const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
                    activeSection === key
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {title}
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeSection === 'all' ? (
              // Show all sections
              sectionKeys.map((key) => {
                const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const content = sections[key];
                
                return (
                  <div key={key} className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-500">
                      {title}
                    </h3>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                      {content}
                    </div>
                  </div>
                );
              })
            ) : (
              // Show selected section
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-500">
                  {activeSection.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {sections[activeSection]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
