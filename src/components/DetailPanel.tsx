// Detail Panel Component
// Location: src/components/DetailPanel.tsx

'use client';

import React, { useState } from 'react';
import { X, Edit2, Save, Trash2 } from 'lucide-react';
import { 
  EnhancedFeature, 
  EnhancedCompetitor, 
  EnhancedPersona 
} from '@/types/enhanced-mindmap';

type NodeData = EnhancedFeature | EnhancedCompetitor | EnhancedPersona;

interface DetailPanelProps {
  isOpen: boolean;
  nodeData: NodeData | null;
  nodeType: string | null;
  onClose: () => void;
  onSave?: (data: NodeData) => void;
  onDelete?: (id: string) => void;
}

export function DetailPanel({ 
  isOpen, 
  nodeData, 
  nodeType, 
  onClose, 
  onSave, 
  onDelete 
}: DetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<NodeData | null>(nodeData);

  if (!isOpen || !nodeData) return null;

  const handleSave = () => {
    if (onSave && editedData) {
      onSave(editedData);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this item?')) {
      onDelete(nodeData.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{nodeData.title}</h2>
            <p className="text-sm text-gray-400 mt-1 capitalize">{nodeType} Details</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5 text-gray-400" />
              </button>
            )}
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-600/20 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {nodeType === 'feature' && nodeData.type === 'feature' && (
            <FeatureDetails data={nodeData as EnhancedFeature} isEditing={isEditing} />
          )}
          
          {nodeType === 'competitor' && nodeData.type === 'competitor' && (
            <CompetitorDetails data={nodeData as EnhancedCompetitor} isEditing={isEditing} />
          )}
          
          {nodeType === 'persona' && nodeData.type === 'persona' && (
            <PersonaDetails data={nodeData as EnhancedPersona} isEditing={isEditing} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center bg-gray-800/50">
          <div className="text-sm text-gray-400">
            Last updated: {nodeData.updatedAt ? new Date(nodeData.updatedAt).toLocaleString() : 'Never'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Feature Details Sub-component
function FeatureDetails({ data, isEditing }: { data: EnhancedFeature; isEditing: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
        {isEditing ? (
          <textarea 
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700"
            rows={3}
            defaultValue={data.description}
          />
        ) : (
          <p className="text-gray-300">{data.description}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Overview & Purpose</h3>
        <p className="text-gray-300">{data.overview}</p>
      </div>

      {data.userStories && data.userStories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">User Stories</h3>
          <div className="space-y-3">
            {data.userStories.map((story) => (
              <div key={story.id} className="bg-gray-800/50 p-4 rounded border border-gray-700">
                <p className="text-gray-300">
                  <span className="text-blue-400 font-medium">As a {story.persona}</span>, 
                  I want to <span className="text-purple-400 font-medium">{story.need}</span> so 
                  that <span className="text-green-400 font-medium">{story.goal}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.acceptanceCriteria && data.acceptanceCriteria.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Acceptance Criteria</h3>
          <ul className="space-y-2">
            {data.acceptanceCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 mt-1">✓</span>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.technicalImplementation && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Technical Implementation</h3>
          <div className="grid grid-cols-2 gap-4">
            {data.technicalImplementation.frontend && (
              <div className="bg-gray-800/50 p-3 rounded">
                <h4 className="font-medium text-purple-400 mb-2">Frontend</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {data.technicalImplementation.frontend.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.technicalImplementation.backend && (
              <div className="bg-gray-800/50 p-3 rounded">
                <h4 className="font-medium text-blue-400 mb-2">Backend</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {data.technicalImplementation.backend.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {data.scoring && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Feature Scoring</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-purple-400">{data.scoring.complexity}</div>
              <div className="text-xs text-gray-400 mt-1">Complexity</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-green-400">{data.scoring.impact}</div>
              <div className="text-xs text-gray-400 mt-1">Impact</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-orange-400">{data.scoring.effort}</div>
              <div className="text-xs text-gray-400 mt-1">Effort</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-blue-400">{data.scoring.roi?.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">ROI</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Competitor Details Sub-component
function CompetitorDetails({ data, isEditing }: { data: EnhancedCompetitor; isEditing: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
        <p className="text-gray-300">{data.description}</p>
      </div>

      {data.url && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Website</h3>
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            {data.url}
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {data.strengths && data.strengths.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Strengths</h3>
            <ul className="space-y-2">
              {data.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400 mt-1">+</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.weaknesses && data.weaknesses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Weaknesses</h3>
            <ul className="space-y-2">
              {data.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-300">
                  <span className="text-red-400 mt-1">-</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Our Competitive Advantage</h3>
        <p className="text-purple-300">{data.ourAdvantage}</p>
      </div>
    </div>
  );
}

// Persona Details Sub-component
function PersonaDetails({ data, isEditing }: { data: EnhancedPersona; isEditing: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
        <p className="text-gray-300">{data.description}</p>
      </div>

      {data.quote && (
        <div className="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3">
          <p className="text-lg italic text-gray-300">"{data.quote}"</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Demographics</h3>
          <div className="space-y-2 text-gray-300">
            {data.demographics.ageRange && <p><strong>Age:</strong> {data.demographics.ageRange}</p>}
            {data.demographics.location && <p><strong>Location:</strong> {data.demographics.location}</p>}
            {data.demographics.occupation && <p><strong>Occupation:</strong> {data.demographics.occupation}</p>}
            {data.demographics.income && <p><strong>Income:</strong> {data.demographics.income}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Behavior</h3>
          <div className="space-y-2 text-gray-300">
            {data.behavior?.techSavviness && (
              <p><strong>Tech Level:</strong> {data.behavior.techSavviness}</p>
            )}
            {data.behavior?.preferredChannels && (
              <div>
                <strong>Channels:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.behavior.preferredChannels.map((channel, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-xs">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Pain Points</h3>
        <ul className="space-y-2">
          {data.psychographics.painPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-1">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Goals & Motivations</h3>
        <ul className="space-y-2">
          {data.psychographics.goals.map((goal, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-300">
              <span className="text-green-400 mt-1">•</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

