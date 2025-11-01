// src/components/MindmapFlow.tsx
'use client';

import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MindmapData } from '@/types/mindmap';

interface MindmapFlowProps {
  data: MindmapData;
  onSave?: () => void;
}

export default function MindmapFlow({ data, onSave }: MindmapFlowProps) {
  // Generate nodes and edges from mindmap data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 0;

    // Helper to create node ID
    const getNodeId = () => `node-${nodeId++}`;

    // 1. Center: Project Overview
    const projectId = getNodeId();
    nodes.push({
      id: projectId,
      type: 'default',
      position: { x: 400, y: 50 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-lg mb-1">🎯 {data.projectName}</div>
            <div className="text-xs text-gray-600 max-w-[200px]">{data.projectDescription}</div>
            <div className="text-xs text-purple-600 mt-1">{data.targetAudience}</div>
          </div>
        ),
      },
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: '2px solid #5a67d8',
        borderRadius: '12px',
        padding: '16px',
        width: 280,
      },
    });

    // 2. Competitors Branch (Left)
    const competitorsParentId = getNodeId();
    nodes.push({
      id: competitorsParentId,
      position: { x: 50, y: 250 },
      data: { label: '🏆 Competitors' },
      style: {
        background: '#fbbf24',
        color: '#78350f',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px',
        fontWeight: 'bold',
      },
    });
    edges.push({
      id: `${projectId}-${competitorsParentId}`,
      source: projectId,
      target: competitorsParentId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    });

    // Competitor children
    data.competitors.slice(0, 3).forEach((competitor, i) => {
      const compId = getNodeId();
      nodes.push({
        id: compId,
        position: { x: 50, y: 350 + i * 120 },
        data: {
          label: (
            <div className="text-left text-xs">
              <div className="font-bold mb-1">{competitor.name}</div>
              <div className="text-gray-600 mb-1">💪 {competitor.strength}</div>
              <div className="text-green-600">✨ {competitor.ourAdvantage}</div>
            </div>
          ),
        },
        style: {
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '10px',
          width: 220,
        },
      });
      edges.push({
        id: `${competitorsParentId}-${compId}`,
        source: competitorsParentId,
        target: compId,
        type: 'smoothstep',
        style: { stroke: '#fbbf24' },
      });
    });

    // 3. Tech Stack Branch (Right)
    const techStackParentId = getNodeId();
    nodes.push({
      id: techStackParentId,
      position: { x: 750, y: 250 },
      data: { label: '⚙️ Tech Stack' },
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '2px solid #2563eb',
        borderRadius: '8px',
        padding: '12px',
        fontWeight: 'bold',
      },
    });
    edges.push({
      id: `${projectId}-${techStackParentId}`,
      source: projectId,
      target: techStackParentId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    });

    // Tech stack children
    const techItems = [
      { label: 'Frontend', value: data.techStack.frontend, emoji: '🎨' },
      { label: 'Backend', value: data.techStack.backend, emoji: '⚡' },
      { label: 'Database', value: data.techStack.database, emoji: '💾' },
      { label: 'Auth', value: data.techStack.auth, emoji: '🔐' },
      { label: 'Payments', value: data.techStack.payments, emoji: '💳' },
      { label: 'Hosting', value: data.techStack.hosting, emoji: '☁️' },
    ];

    techItems.forEach((item, i) => {
      const techId = getNodeId();
      const row = Math.floor(i / 2);
      const col = i % 2;
      nodes.push({
        id: techId,
        position: { x: 720 + col * 140, y: 350 + row * 80 },
        data: {
          label: (
            <div className="text-center text-xs">
              <div className="text-lg mb-1">{item.emoji}</div>
              <div className="font-semibold">{item.label}</div>
              <div className="text-gray-600">{item.value}</div>
            </div>
          ),
        },
        style: {
          background: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '8px',
          width: 120,
        },
      });
      edges.push({
        id: `${techStackParentId}-${techId}`,
        source: techStackParentId,
        target: techId,
        type: 'smoothstep',
        style: { stroke: '#93c5fd' },
      });
    });

    // 4. Features Branch (Bottom)
    const featuresParentId = getNodeId();
    nodes.push({
      id: featuresParentId,
      position: { x: 380, y: 650 },
      data: { label: '📄 Core Features (PRD)' },
      style: {
        background: '#8b5cf6',
        color: 'white',
        border: '2px solid #7c3aed',
        borderRadius: '8px',
        padding: '12px',
        fontWeight: 'bold',
      },
    });
    edges.push({
      id: `${projectId}-${featuresParentId}`,
      source: projectId,
      target: featuresParentId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    });

    // Feature children (max 8)
    data.features.slice(0, 8).forEach((feature, i) => {
      const featureId = getNodeId();
      const col = i % 4;
      const row = Math.floor(i / 4);
      
      const priorityColors = {
        high: { bg: '#fecaca', border: '#ef4444', text: '#991b1b' },
        medium: { bg: '#fed7aa', border: '#f97316', text: '#9a3412' },
        low: { bg: '#d9f99d', border: '#84cc16', text: '#3f6212' },
      };
      const colors = priorityColors[feature.priority];

      nodes.push({
        id: featureId,
        position: { x: 180 + col * 160, y: 750 + row * 100 },
        data: {
          label: (
            <div className="text-left text-xs">
              <div className="font-bold mb-1">{feature.title}</div>
              <div className="text-gray-600 text-[10px] mb-1">{feature.description}</div>
              <div
                className="text-[10px] font-semibold px-2 py-0.5 rounded inline-block"
                style={{
                  background: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {feature.priority.toUpperCase()}
              </div>
            </div>
          ),
        },
        style: {
          background: '#f3e8ff',
          border: '1px solid #8b5cf6',
          borderRadius: '8px',
          padding: '10px',
          width: 145,
        },
      });
      edges.push({
        id: `${featuresParentId}-${featureId}`,
        source: featuresParentId,
        target: featureId,
        type: 'smoothstep',
        style: { stroke: '#c4b5fd' },
      });
    });

    // 5. Monetization Branch (Top Right)
    const monetizationId = getNodeId();
    nodes.push({
      id: monetizationId,
      position: { x: 700, y: 50 },
      data: {
        label: (
          <div className="text-center text-xs">
            <div className="text-lg mb-1">💰</div>
            <div className="font-bold">Monetization</div>
            <div className="text-gray-600 mt-1">{data.monetization.model}</div>
            <div className="font-semibold text-green-600">{data.monetization.pricing}</div>
          </div>
        ),
      },
      style: {
        background: '#d1fae5',
        border: '2px solid #10b981',
        borderRadius: '8px',
        padding: '12px',
        width: 150,
      },
    });
    edges.push({
      id: `${projectId}-${monetizationId}`,
      source: projectId,
      target: monetizationId,
      type: 'smoothstep',
      style: { stroke: '#10b981', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    });

    // 6. User Persona Branch (Top Left)
    const personaId = getNodeId();
    nodes.push({
      id: personaId,
      position: { x: 100, y: 50 },
      data: {
        label: (
          <div className="text-center text-xs">
            <div className="text-lg mb-1">👥</div>
            <div className="font-bold">{data.userPersona.name}</div>
            <div className="text-gray-600 mt-1 text-[10px]">{data.userPersona.description}</div>
            <div className="text-red-600 mt-1 text-[10px]">😣 {data.userPersona.painPoint}</div>
            <div className="text-green-600 mt-1 text-[10px]">🎯 {data.userPersona.goal}</div>
          </div>
        ),
      },
      style: {
        background: '#fce7f3',
        border: '2px solid #ec4899',
        borderRadius: '8px',
        padding: '12px',
        width: 180,
      },
    });
    edges.push({
      id: `${projectId}-${personaId}`,
      source: projectId,
      target: personaId,
      type: 'smoothstep',
      style: { stroke: '#ec4899', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' },
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Restore saved node positions after initial render
  useEffect(() => {
    if (typeof window !== 'undefined' && nodes.length > 0 && nodes[0]?.id) {
      const savedState = localStorage.getItem(`flow-state-${data.projectName}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            // Create a map of saved node positions by ID
            const savedPositions = new Map(
              parsed.nodes.map((n: Node) => [n.id, n.position])
            );
            // Only restore if we have matching node IDs (don't restore if data changed)
            const hasMatchingNodes = nodes.some(n => savedPositions.has(n.id));
            if (hasMatchingNodes) {
              setNodes((currentNodes) =>
                currentNodes.map((node) => {
                  const savedPos = savedPositions.get(node.id) as { x: number; y: number } | undefined;
                  // Only update position if savedPos has valid x and y coordinates
                  if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
                    return { 
                      ...node, 
                      position: { x: savedPos.x, y: savedPos.y } 
                    };
                  }
                  return node;
                })
              );
            }
          }
          if (parsed.edges && Array.isArray(parsed.edges)) {
            setEdges(parsed.edges);
          }
        } catch (e) {
          console.error('Error restoring saved flow state:', e);
        }
      }
    }
  }, [data.projectName]); // Re-run when project name changes

  // Save flow state to localStorage when nodes or edges change
  useEffect(() => {
    if (typeof window !== 'undefined' && nodes.length > 0) {
      const flowState = {
        nodes: nodes.map((n) => ({ id: n.id, position: n.position, data: n.data, type: n.type })),
        edges,
        timestamp: Date.now(),
      };
      localStorage.setItem(`flow-state-${data.projectName}`, JSON.stringify(flowState));
    }
  }, [nodes, edges, data.projectName, setNodes, setEdges]);

  return (
    <div className="w-full h-[800px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 overflow-hidden relative">
      {/* Debug Badge - Remove this after confirming it works */}
      <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
        ✅ React Flow Active
      </div>
      
      <ReactFlow
        className="bg-gray-900"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#4c1d95" />
        <Controls className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-white" />
        <MiniMap
          nodeColor={(node) => {
            if (node.style?.background) {
              const bg = node.style.background as string;
              if (bg.includes('linear-gradient')) return '#667eea';
              return bg;
            }
            return '#e5e7eb';
          }}
          className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg"
        />
      </ReactFlow>

      {onSave && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={onSave}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            💾 Save Mindmap
          </button>
        </div>
      )}
    </div>
  );
}

