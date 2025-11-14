// components/features/PRDModal.tsx
'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { DetailedPRD, UserStory, APIEndpoint } from '@/types/feature';
import { X, RefreshCw, Check, Edit2, Save } from 'lucide-react';

interface PRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle: string;
  featureId: string;
  prd: DetailedPRD | null;
  onRegeneratePRD: () => void;
  onApprovePRD: () => void;
  onUpdatePRD?: (updatedPRD: Partial<DetailedPRD>) => void;
}

export default function PRDModal({
  isOpen,
  onClose,
  featureTitle,
  featureId,
  prd,
  onRegeneratePRD,
  onApprovePRD,
  onUpdatePRD
}: PRDModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOverview, setEditedOverview] = useState(prd?.overview || '');

  if (!prd) {
    return null;
  }

  const tabs = [
    { name: 'Overview', icon: '📋' },
    { name: 'User Stories', icon: '👥' },
    { name: 'Technical Specs', icon: '⚙️' },
    { name: 'Implementation', icon: '🔨' },
    { name: 'Testing', icon: '🧪' }
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-white">
                      {featureTitle}
                    </Dialog.Title>
                    <p className="text-sm text-gray-400 mt-1">
                      Product Requirements Document • v{prd.version}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <Tab.Group>
                  <Tab.List className="flex space-x-1 border-b border-gray-700 px-6 bg-gray-900/50">
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.name}
                        className={({ selected }) =>
                          `px-4 py-3 text-sm font-medium transition-all focus:outline-none ${
                            selected
                              ? 'text-blue-400 border-b-2 border-blue-400'
                              : 'text-gray-400 hover:text-gray-300'
                          }`
                        }
                      >
                        <span className="flex items-center gap-2">
                          <span>{tab.icon}</span>
                          {tab.name}
                        </span>
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Overview Tab */}
                    <Tab.Panel className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Feature Overview</h3>
                        {isEditing ? (
                          <textarea
                            value={editedOverview}
                            onChange={(e) => setEditedOverview(e.target.value)}
                            className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {prd.overview}
                          </p>
                        )}
                      </div>

                      {prd.technicalSpecs.thirdPartyIntegrations && prd.technicalSpecs.thirdPartyIntegrations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Third-Party Integrations</h3>
                          <div className="flex flex-wrap gap-2">
                            {prd.technicalSpecs.thirdPartyIntegrations.map((integration, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm"
                              >
                                {integration}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Estimated Effort</h3>
                        <p className="text-gray-300">{prd.estimatedEffort}</p>
                      </div>

                      {prd.risks && prd.risks.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">⚠️ Risks</h3>
                          <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {prd.risks.map((risk, idx) => (
                              <li key={idx}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Tab.Panel>

                    {/* User Stories Tab */}
                    <Tab.Panel className="space-y-4">
                      {prd.userStories.map((story: UserStory, idx: number) => (
                        <div key={story.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <h4 className="text-white font-medium mb-2">Story #{idx + 1}</h4>
                          <div className="space-y-2 text-gray-300">
                            <p><span className="text-blue-400">As a</span> {story.role}</p>
                            <p><span className="text-green-400">I want to</span> {story.action}</p>
                            <p><span className="text-purple-400">So that</span> {story.benefit}</p>
                          </div>
                          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-400 font-medium mb-1">Acceptance Criteria:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                {story.acceptanceCriteria.map((criteria, cIdx) => (
                                  <li key={cIdx}>{criteria}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </Tab.Panel>

                    {/* Technical Specs Tab */}
                    <Tab.Panel className="space-y-6">
                      {/* Frontend */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <span>💻</span> Frontend
                        </h3>
                        <div className="p-4 bg-gray-800 rounded-lg space-y-3">
                          <p className="text-gray-300">{prd.technicalSpecs.frontend.description}</p>
                          {prd.technicalSpecs.frontend.components && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Components:</p>
                              <div className="flex flex-wrap gap-2">
                                {prd.technicalSpecs.frontend.components.map((comp, idx) => (
                                  <code key={idx} className="px-2 py-1 bg-gray-900 text-blue-400 rounded text-sm">
                                    {comp}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
                          {prd.technicalSpecs.frontend.libraries && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Libraries:</p>
                              <div className="flex flex-wrap gap-2">
                                {prd.technicalSpecs.frontend.libraries.map((lib, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-sm">
                                    {lib}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Backend */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <span>⚙️</span> Backend
                        </h3>
                        <div className="p-4 bg-gray-800 rounded-lg space-y-3">
                          <p className="text-gray-300">{prd.technicalSpecs.backend.description}</p>
                          {prd.technicalSpecs.backend.files && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Files:</p>
                              <div className="space-y-1">
                                {prd.technicalSpecs.backend.files.map((file, idx) => (
                                  <code key={idx} className="block px-2 py-1 bg-gray-900 text-gray-300 rounded text-sm">
                                    {file}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Database */}
                      {prd.technicalSpecs.database.tables.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <span>🗄️</span> Database Schema
                          </h3>
                          <div className="space-y-3">
                            {prd.technicalSpecs.database.tables.map((table, idx) => (
                              <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                                <h4 className="text-white font-medium mb-2">{table.name}</h4>
                                <div className="space-y-1">
                                  {table.fields.map((field, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-2 text-sm">
                                      <code className="text-blue-400">{field.name}</code>
                                      <span className="text-gray-500">:</span>
                                      <span className="text-green-400">{field.type}</span>
                                      {field.constraints && field.constraints.length > 0 && (
                                        <span className="text-gray-400">
                                          ({field.constraints.join(', ')})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* APIs */}
                      {prd.technicalSpecs.apis.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <span>🔌</span> API Endpoints
                          </h3>
                          <div className="space-y-2">
                            {prd.technicalSpecs.apis.map((api: APIEndpoint, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    api.method === 'GET' ? 'bg-blue-900/30 text-blue-400' :
                                    api.method === 'POST' ? 'bg-green-900/30 text-green-400' :
                                    api.method === 'PUT' ? 'bg-yellow-900/30 text-yellow-400' :
                                    api.method === 'DELETE' ? 'bg-red-900/30 text-red-400' :
                                    'bg-purple-900/30 text-purple-400'
                                  }`}>
                                    {api.method}
                                  </span>
                                  <code className="text-gray-300">{api.path}</code>
                                  {api.authentication && (
                                    <span className="text-xs text-orange-400">🔒 Auth Required</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400">{api.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Tab.Panel>

                    {/* Implementation Tab */}
                    <Tab.Panel className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Implementation Steps</h3>
                        <ol className="space-y-2">
                          {prd.implementationSteps.map((step, idx) => (
                            <li key={idx} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center text-sm font-medium">
                                {idx + 1}
                              </span>
                              <span className="text-gray-300 pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </Tab.Panel>

                    {/* Testing Tab */}
                    <Tab.Panel className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Testing Strategy</h3>
                        <ul className="space-y-2">
                          {prd.testingStrategy.map((test, idx) => (
                            <li key={idx} className="flex gap-2 text-gray-300">
                              <span className="text-green-400">✓</span>
                              {test}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Edge Cases</h3>
                        <ul className="space-y-2">
                          {prd.edgeCases.map((edge, idx) => (
                            <li key={idx} className="flex gap-2 text-gray-300">
                              <span className="text-yellow-400">⚠️</span>
                              {edge}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Security Considerations</h3>
                        <ul className="space-y-2">
                          {prd.securityConsiderations.map((security, idx) => (
                            <li key={idx} className="flex gap-2 text-gray-300">
                              <span className="text-red-400">🔒</span>
                              {security}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Acceptance Criteria</h3>
                        <ul className="space-y-2">
                          {prd.acceptanceCriteria.map((criteria, idx) => (
                            <li key={idx} className="flex gap-2 text-gray-300">
                              <span className="text-blue-400">✓</span>
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50">
                  <div className="flex gap-3">
                    <button
                      onClick={onRegeneratePRD}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate PRD
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      {isEditing ? 'Save Changes' : 'Edit PRD'}
                    </button>
                  </div>
                  <button
                    onClick={onApprovePRD}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    Approve & Mark Ready
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

