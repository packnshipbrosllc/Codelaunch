// components/InteractiveBuilder.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import DecisionNode from './DecisionNode';
import ChoicePanel from './ChoicePanel';
import ProgressTracker from './ProgressTracker';
import { DecisionNode as DecisionNodeType, Choice, AppPurpose, AppType } from '@/types/decision-tree';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

const nodeTypes = {
  decision: DecisionNode,
};

interface InteractiveBuilderProps {
  userId: string;
}

export default function InteractiveBuilder({ userId }: InteractiveBuilderProps) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [sessionId] = useState(() => uuidv4());
  
  // Decision state
  const [currentQuestion, setCurrentQuestion] = useState<DecisionNodeType | null>(null);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [appPurpose, setAppPurpose] = useState<AppPurpose | null>(null);
  const [appType, setAppType] = useState<AppType | null>(null);
  
  // UI state
  const [showChoicePanel, setShowChoicePanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ currentStep: 0, totalSteps: 0, percentage: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Prevent double initialization
  const isInitialized = useRef(false);
  const processedQuestions = useRef<Set<string>>(new Set());

  // Initialize with root question
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchNextQuestion();
    }
  }, []);

  // Fetch next question from API
  const fetchNextQuestion = async () => {
    if (isLoading || isProcessing) return; // Prevent double calls
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/decision-tree/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDecisions: decisions,
          appPurpose,
          appType
        })
      });

      const data = await response.json();

      if (data.completed) {
        // All questions answered!
        handleCompletion();
        return;
      }

      if (data.question && !processedQuestions.current.has(data.question.id)) {
        processedQuestions.current.add(data.question.id);
        setCurrentQuestion(data.question);
        setProgress(data.progress);
        addQuestionToFlow(data.question);
        setShowChoicePanel(true);
      }

    } catch (error) {
      console.error('Error fetching next question:', error);
      alert('Failed to load next question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add question node to React Flow
  const addQuestionToFlow = (question: DecisionNodeType) => {
    const newNode: Node = {
      id: question.id,
      type: 'decision',
      position: { 
        x: 100 + (progress.currentStep * 250), 
        y: 100 
      },
      data: {
        label: question.question,
        description: question.explanation,
        category: question.category,
        nodeType: question.nodeType,
        isClickable: true,
        isCompleted: false,
        isLocked: false,
        onClick: () => handleNodeClick(question)
      }
    };

    setNodes((nds) => [...nds, newNode]);

    // Add edge from previous node if exists
    if (nodes.length > 0) {
      const previousNode = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `e-${previousNode.id}-${question.id}`,
        source: previousNode.id,
        target: question.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#9333ea', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9333ea' }
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  };

  // Handle when user clicks a node
  const handleNodeClick = (question: DecisionNodeType) => {
    setCurrentQuestion(question);
    setShowChoicePanel(true);
  };

  // Handle when user selects a choice
  const handleChoiceSelect = async (choice: Choice) => {
    if (!currentQuestion || isProcessing) return; // Prevent double clicks
    
    setIsProcessing(true);

    try {
      // Update decisions
      const newDecisions = {
        ...decisions,
        [currentQuestion.id]: choice.value
      };
      setDecisions(newDecisions);

      // Update app purpose/type if this was root or platform question
      if (currentQuestion.id === 'root') {
        setAppPurpose(choice.value as AppPurpose);
      } else if (currentQuestion.id === 'platform') {
        setAppType(choice.value as AppType);
      }

      // Mark current node as completed
      setNodes((nds) =>
        nds.map((node) =>
          node.id === currentQuestion.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  isClickable: false,
                  isCompleted: true,
                  label: `${choice.label}`, // Update label to show choice
                  selectedValue: choice.value
                }
              }
            : node
        )
      );

      // Close panel
      setShowChoicePanel(false);

      // Save progress to database
      await saveProgress(newDecisions);

      // Fetch next question
      await fetchNextQuestion();
    } finally {
      setIsProcessing(false);
    }
  };

  // Save progress to Supabase
  const saveProgress = async (currentDecisions: Record<string, string>) => {
    try {
      await fetch('/api/decision-tree/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          appPurpose,
          appType,
          decisions: currentDecisions,
          currentStep: progress.currentStep,
          totalSteps: progress.totalSteps
        })
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      // Don't block user flow if save fails
    }
  };

  // Handle completion - all questions answered
  const handleCompletion = () => {
    // Add final "Generate" node
    const generateNode: Node = {
      id: 'generate',
      type: 'decision',
      position: { x: 100 + (progress.currentStep * 250), y: 100 },
      data: {
        label: '🚀 Generate My App!',
        description: 'Click to create your app structure',
        category: 'Final Step',
        nodeType: 'generate',
        isClickable: true,
        isCompleted: false,
        isLocked: false,
        onClick: handleGenerate
      }
    };

    setNodes((nds) => [...nds, generateNode]);

    // Add edge to generate node
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `e-${lastNode.id}-generate`,
        source: lastNode.id,
        target: 'generate',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  };

  // Generate the final mindmap/PRD/code
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/decision-tree/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          decisions,
          appPurpose,
          appType
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Save the mindmap and redirect to create page with the data
        const saveResponse = await fetch('/api/save-mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mindmapData: data.data || data.mindmapData
          })
        });

        const saveData = await saveResponse.json();

        if (saveData.success && saveData.project) {
          // Redirect to project page
          router.push(`/project/${saveData.project.id}`);
        } else {
          // Fallback: redirect to create page with data in URL
          const encodedData = encodeURIComponent(JSON.stringify(data.data || data.mindmapData));
          router.push(`/create?data=${encodedData}`);
        }
      } else {
        throw new Error(data.error || 'Failed to generate app');
      }

    } catch (error) {
      console.error('Error generating app:', error);
      alert('Failed to generate your app. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-screen w-full relative">
      {/* Progress tracker */}
      {progress.currentStep > 0 && (
        <ProgressTracker
          currentStep={progress.currentStep}
          totalSteps={progress.totalSteps}
          percentage={progress.percentage}
          decisions={decisions}
        />
      )}

      {/* React Flow canvas */}
      <div className={`h-full ${progress.currentStep > 0 ? 'pt-32' : ''}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"
        >
          <Background color="#1f2937" gap={20} variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Choice panel */}
      {showChoicePanel && currentQuestion && (
        <ChoicePanel
          question={currentQuestion}
          onSelect={handleChoiceSelect}
          onClose={() => setShowChoicePanel(false)}
        />
      )}

      {/* Loading overlay */}
      {(isLoading || isGenerating) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/50 rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
            <div className="font-semibold text-white text-lg">
              {isGenerating ? 'Generating your app...' : 'Loading...'}
            </div>
            {isGenerating && (
              <p className="text-sm text-gray-400 text-center max-w-sm">
                Creating your custom mindmap with competitor research...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Welcome message when starting */}
      {nodes.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
          <div className="text-center max-w-2xl px-6">
            <span className="text-6xl mb-4 block animate-rocket-bounce">🚀</span>
            <h1 className="text-4xl font-bold text-white mb-4">
              Let's Build Your App Together!
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Answer a few questions and we'll create a custom app structure just for you.
              Don't worry - we'll explain everything along the way! 
            </p>
            <div className="inline-block animate-bounce">
              <span className="text-2xl">👇</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

