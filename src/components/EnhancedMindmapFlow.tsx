// Enhanced Mindmap Flow - Main Component
// Location: src/components/EnhancedMindmapFlow.tsx

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, Download } from 'lucide-react';

import { EnhancedFeatureNode } from './nodes/EnhancedFeatureNode';
import { EnhancedCompetitorNode } from './nodes/EnhancedCompetitorNode';
import { EnhancedPersonaNode } from './nodes/EnhancedPersonaNode';
import PRDModal from '@/components/features/PRDModal';
import { 
  EnhancedMindmapData, 
  NodeExpansionState,
} from '@/types/enhanced-mindmap';
import { DetailedPRD } from '@/types/feature';

// Custom node types
const nodeTypes = {
  enhancedFeature: EnhancedFeatureNode,
  enhancedCompetitor: EnhancedCompetitorNode,
  enhancedPersona: EnhancedPersonaNode,
};

interface EnhancedMindmapFlowProps {
  data: EnhancedMindmapData;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onAddNode?: (type: string, parentId?: string) => void;
  editable?: boolean;
}

export function EnhancedMindmapFlow({ 
  data, 
  onSave, 
  onAddNode,
  editable = true 
}: EnhancedMindmapFlowProps) {
  const [expandedNodes, setExpandedNodes] = useState<NodeExpansionState>({});
  
  // PRD Modal state
  const [prdModalOpen, setPRDModalOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);

  // Generate initial nodes and edges from data - MEMOIZED WITHOUT expandedNodes to prevent infinite loop
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Central Overview Node
    if (data.overview) {
      nodes.push({
        id: 'overview',
        type: 'default',
        position: { x: 400, y: 50 },
        data: {
          label: (
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-2">{data.projectName}</div>
              <div className="text-sm text-gray-300">{data.overview.elevatorPitch}</div>
            </div>
          ),
        },
        style: {
          width: 400,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '16px',
          padding: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      });
    } else {
      // Fallback overview node
      nodes.push({
        id: 'overview',
        type: 'default',
        position: { x: 400, y: 50 },
        data: {
          label: (
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-2">{data.projectName}</div>
              <div className="text-sm text-gray-300">{data.description}</div>
            </div>
          ),
        },
        style: {
          width: 400,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '16px',
          padding: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      });
    }

    // Feature Nodes
    data.features.forEach((feature, index) => {
      const id = `feature-${feature.id}`;
      nodes.push({
        id,
        type: 'enhancedFeature',
        position: { 
          x: 100 + (index % 3) * 400, 
          y: 400 + Math.floor(index / 3) * 350
        },
        data: {
          ...feature,
          isExpanded: false, // Will be set from expandedNodes state in useEffect
          onExpand: () => {}, // Placeholder - will be set in useEffect
        },
      });

      edges.push({
        id: `e-overview-${id}`,
        source: 'overview',
        target: id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      });
    });

    // Competitor Nodes
    data.competitors.forEach((competitor, index) => {
      const id = `competitor-${competitor.id}`;
      nodes.push({
        id,
        type: 'enhancedCompetitor',
        position: { 
          x: -300, 
          y: 200 + (index * 250) 
        },
        data: {
          ...competitor,
          isExpanded: false, // Will be set from expandedNodes state in useEffect
          onExpand: () => {}, // Placeholder - will be set in useEffect
        },
      });

      edges.push({
        id: `e-overview-${id}`,
        source: 'overview',
        target: id,
        type: 'smoothstep',
        style: { stroke: '#f97316', strokeWidth: 2 },
      });
    });

    // Persona Nodes
    data.personas.forEach((persona, index) => {
      const id = `persona-${persona.id}`;
      nodes.push({
        id,
        type: 'enhancedPersona',
        position: { 
          x: 1100, 
          y: 200 + (index * 280) 
        },
        data: {
          ...persona,
          isExpanded: false, // Will be set from expandedNodes state in useEffect
          onExpand: () => {}, // Placeholder - will be set in useEffect
        },
      });

      edges.push({
        id: `e-overview-${id}`,
        source: 'overview',
        target: id,
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      });
    });

    // Tech Stack Nodes
    data.techStack.forEach((tech, index) => {
      const id = `tech-${tech.id}`;
      nodes.push({
        id,
        type: 'default',
        position: { 
          x: 800 + (index % 3) * 200, 
          y: 850 + Math.floor(index / 3) * 100
        },
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold text-white">{tech.title}</div>
              <div className="text-xs text-gray-400">{tech.category}</div>
            </div>
          ),
        },
        style: {
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '16px',
          padding: '16px',
          color: 'white',
          width: 180,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      });

      // Connect tech stack to relevant features
      const relevantFeatures = data.features.filter(f => 
        f.technicalImplementation?.frontend?.some(item => item.includes(tech.title)) ||
        f.technicalImplementation?.backend?.some(item => item.includes(tech.title))
      );

      relevantFeatures.forEach(feature => {
        edges.push({
          id: `e-${id}-feature-${feature.id}`,
          source: id,
          target: `feature-${feature.id}`,
          type: 'smoothstep',
          style: { stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5,5' },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]); // ✅ REMOVED expandedNodes dependency - this was causing infinite loop

  // ✅ HOOKS MUST BE DECLARED AFTER useMemo BUT BEFORE THEY'RE USED
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ✅ Use refs to track state and prevent infinite loops
  const isInitializedRef = useRef(false);
  const dataRef = useRef(data);
  const nodesRef = useRef(nodes);

  // ✅ Keep nodesRef in sync with nodes state
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // ✅ Sync nodes/edges ONLY when data actually changes (not when arrays are recreated)
  useEffect(() => {
    // Only update if data reference changed (new data passed in)
    if (dataRef.current !== data) {
      dataRef.current = data;
      setNodes(initialNodes);
      setEdges(initialEdges);
      isInitializedRef.current = true;
    } else if (!isInitializedRef.current) {
      // First mount - initialize
      isInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // Only depend on data - initialNodes/initialEdges are derived from data

  // ✅ Now handleNodeExpand can safely use setNodes
  const handleNodeExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newState = {
        ...prev,
        [nodeId]: !prev[nodeId],
      };
      
      // Update the node data immediately
      setNodes(nds => 
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                isExpanded: newState[nodeId],
              },
            };
          }
          return node;
        })
      );
      
      return newState;
    });
  }, [setNodes]);

  // PRD Handlers - Use ref to read nodes without causing re-renders
  const handleGeneratePRD = useCallback(async (featureId: string) => {
    try {
      setIsGeneratingPRD(true);
      
      // Get current node data from ref (doesn't cause re-renders)
      const currentNodes = nodesRef.current;
      const featureNode = currentNodes.find(n => n.id === featureId);

      if (!featureNode) {
        setIsGeneratingPRD(false);
        return;
      }

      // Get all features for context from ref
      const allFeatures = currentNodes
        .filter(n => n.id !== featureId && n.type === 'enhancedFeature')
        .map(n => ({
          title: n.data.title || n.data.name || 'Feature',
          description: n.data.description || ''
        }));

      const response = await fetch('/api/features/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureId: featureId,
          featureTitle: featureNode.data.title || featureNode.data.name || 'Feature',
          featureDescription: featureNode.data.description || '',
          priority: featureNode.data.priority || 'must-have',
          complexity: featureNode.data.complexity || 'moderate',
          appContext: `App Name: ${data.projectName}\nApp Description: ${data.description || data.overview?.elevatorPitch || ''}`,
          allFeatures: allFeatures
        })
      });

      const result = await response.json();

      if (result.success) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === featureId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  prd: result.prd,
                  hasPRD: true,
                  status: 'detailed',
                },
              };
            }
            return node;
          })
        );

        setSelectedFeatureId(featureId);
        setPRDModalOpen(true);
      } else {
        console.error('Failed to generate PRD:', result.error);
      }
    } catch (error) {
      console.error('Error generating PRD:', error);
    } finally {
      setIsGeneratingPRD(false);
    }
  }, [setNodes, data]); // ✅ REMOVED nodes dependency - use functional setState instead

  const handleViewPRD = useCallback((featureId: string) => {
    setSelectedFeatureId(featureId);
    setPRDModalOpen(true);
  }, []);

  const handleApprovePRD = useCallback(() => {
    if (!selectedFeatureId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedFeatureId) {
          return {
            ...node,
            data: {
              ...node.data,
              status: 'ready',
            },
          };
        }
        return node;
      })
    );

    setPRDModalOpen(false);
  }, [selectedFeatureId, setNodes]);

  const handleRegeneratePRD = useCallback(async () => {
    if (!selectedFeatureId) return;
    
    setPRDModalOpen(false);
    await handleGeneratePRD(selectedFeatureId);
  }, [selectedFeatureId, handleGeneratePRD]);

  // ✅ Wire up onExpand handlers ONCE on mount, then only update expanded state
  const handlersSetupRef = useRef(false);
  const previousExpandedNodesRef = useRef<NodeExpansionState>({});
  
  useEffect(() => {
    // First time: set up all handlers
    if (!handlersSetupRef.current) {
      setNodes(nds =>
        nds.map(node => {
          if (node.type === 'enhancedFeature' || node.type === 'enhancedCompetitor' || node.type === 'enhancedPersona') {
            return {
              ...node,
              data: {
                ...node.data,
                isExpanded: expandedNodes[node.id] || false,
                onExpand: handleNodeExpand,
                // Add PRD handlers for feature nodes
                ...(node.type === 'enhancedFeature' && {
                  onViewPRD: handleViewPRD,
                  onGeneratePRD: handleGeneratePRD,
                }),
              },
            };
          }
          return node;
        })
      );
      handlersSetupRef.current = true;
      previousExpandedNodesRef.current = expandedNodes;
    } else {
      // Subsequent times: only update expanded state if it changed
      const expandedChanged = Object.keys(expandedNodes).some(
        key => expandedNodes[key] !== previousExpandedNodesRef.current[key]
      ) || Object.keys(previousExpandedNodesRef.current).some(
        key => !(key in expandedNodes)
      );
      
      if (expandedChanged) {
        setNodes(nds =>
          nds.map(node => {
            if (node.type === 'enhancedFeature' || node.type === 'enhancedCompetitor' || node.type === 'enhancedPersona') {
              return {
                ...node,
                data: {
                  ...node.data,
                  isExpanded: expandedNodes[node.id] || false,
                },
              };
            }
            return node;
          })
        );
        previousExpandedNodesRef.current = expandedNodes;
      }
    }
  }, [expandedNodes, handleNodeExpand, handleViewPRD, handleGeneratePRD, setNodes]);

  // Get selected feature for modal
  const selectedFeature = nodes.find(n => n.id === selectedFeatureId);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    }, eds)),
    [setEdges]
  );

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  const handleExport = useCallback(() => {
    // Export as JSON
    const exportData = {
      mindmap: data,
      layout: {
        nodes: nodes.map(n => ({ id: n.id, position: n.position })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
      },
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.projectName.replace(/\s+/g, '-')}-mindmap.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data, nodes, edges]);

  // Helper function to get priority color for borders
  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Orange  
      case 'low': return '#10b981'; // Green
      default: return '#6366f1'; // Indigo
    }
  };

  return (
    <div className="w-full h-full relative" style={{ width: '100%', height: '100%', minHeight: '600px', background: 'transparent' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          color="rgba(255, 255, 255, 0.05)" 
          gap={20} 
          size={1}
          variant={BackgroundVariant.Dots}
          style={{ backgroundColor: 'transparent' }}
        />
        
        <Controls 
          className="bg-gray-800 border border-gray-700 rounded-lg"
          showInteractive={editable}
        />
        
        <MiniMap 
          className="bg-gray-900 border border-gray-700 rounded-lg"
          nodeColor={(node) => {
            if (node.type === 'enhancedFeature') return '#8b5cf6';
            if (node.type === 'enhancedCompetitor') return '#f97316';
            if (node.type === 'enhancedPersona') return '#3b82f6';
            return '#10b981';
          }}
          maskColor="rgba(0, 0, 0, 0.5)"
        />

        {/* Top Control Panel */}
        <Panel position="top-right" className="space-x-2">
          {editable && onAddNode && (
            <div className="flex gap-2 bg-gray-900 border border-gray-700 rounded-lg p-2 mb-2">
              <button
                onClick={() => onAddNode('feature')}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
              <button
                onClick={() => onAddNode('competitor')}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Competitor
              </button>
              <button
                onClick={() => onAddNode('persona')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Persona
              </button>
            </div>
          )}
          
          <div className="flex gap-2 bg-gray-900 border border-gray-700 rounded-lg p-2">
            <button
              onClick={handleSave}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </Panel>

        {/* Bottom Info Panel */}
        <Panel position="bottom-center">
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-gray-300">{data.features.length} Features</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-300">{data.competitors.length} Competitors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">{data.personas.length} Personas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-300">{data.techStack.length} Tech Items</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* PRD Modal */}
      <PRDModal
        isOpen={prdModalOpen}
        onClose={() => setPRDModalOpen(false)}
        featureTitle={selectedFeature?.data.title || selectedFeature?.data.name || 'Feature'}
        featureId={selectedFeatureId || ''}
        prd={selectedFeature?.data.prd as DetailedPRD || null}
        onRegeneratePRD={handleRegeneratePRD}
        onApprovePRD={handleApprovePRD}
      />

      {/* Loading overlay when generating PRD */}
      {isGeneratingPRD && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-white">Generating comprehensive PRD...</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
