import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Users, Zap, Database, Shield, Globe } from 'lucide-react';
import { AppData, Node, Edge } from '@/types';

interface MindmapStageProps {
  appData: AppData;
  onContinue: () => void;
}

export default function MindmapStage({ appData, onContinue }: MindmapStageProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Generate initial nodes based on app data
    const initialNodes: Node[] = [
      { id: 1, x: 400, y: 200, label: appData.name, type: 'core', icon: '🚀' },
      { id: 2, x: 200, y: 100, label: 'Users', type: 'user', icon: '👥' },
      { id: 3, x: 600, y: 100, label: 'Dashboard', type: 'feature', icon: '📊' },
      { id: 4, x: 200, y: 300, label: 'Authentication', type: 'backend', icon: '🔐' },
      { id: 5, x: 600, y: 300, label: 'Database', type: 'backend', icon: '🗄️' },
      { id: 6, x: 400, y: 400, label: 'API', type: 'integration', icon: '🔌' }
    ];

    const initialEdges: Edge[] = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 },
      { from: 1, to: 6 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 6 },
      { from: 5, to: 6 }
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [appData]);

  const handleMouseDown = (nodeId: number) => {
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedNode === null) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => prev.map(node => 
      node.id === draggedNode ? { ...node, x, y } : node
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getNodeColor = (type: Node['type']) => {
    switch (type) {
      case 'user': return 'fill-blue-500';
      case 'feature': return 'fill-green-500';
      case 'backend': return 'fill-purple-500';
      case 'core': return 'fill-orange-500';
      case 'integration': return 'fill-pink-500';
      default: return 'fill-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Your App Architecture
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Here's how your {appData.name} will be structured. Drag the nodes to explore the relationships.
          </p>
        </div>

        {/* Mindmap Container */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <svg
              ref={svgRef}
              width="100%"
              height="500"
              className="cursor-grab active:cursor-grabbing"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Edges */}
              {edges.map((edge, idx) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                return (
                  <line
                    key={idx}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="40"
                    className={`${getNodeColor(node.type)} cursor-pointer hover:opacity-80 transition-opacity`}
                    onMouseDown={() => handleMouseDown(node.id)}
                  />
                  <text
                    x={node.x}
                    y={node.y - 5}
                    textAnchor="middle"
                    className="fill-white text-sm font-bold pointer-events-none"
                  >
                    {node.icon}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 60}
                    textAnchor="middle"
                    className="fill-white text-xs font-semibold pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-white text-sm">Core</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-white text-sm">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-white text-sm">Features</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-white text-sm">Backend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
              <span className="text-white text-sm">Integration</span>
            </div>
          </div>
        </div>

        {/* App Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Platform</h3>
            <p className="text-gray-300 capitalize">{appData.platform}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Zap className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Template</h3>
            <p className="text-gray-300">{appData.template}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Database className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Tech Stack</h3>
            <p className="text-gray-300">{appData.techStack.join(', ')}</p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Continue to PRD
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
