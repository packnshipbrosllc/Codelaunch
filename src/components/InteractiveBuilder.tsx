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
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Prevent double initialization
  const isInitialized = useRef(false);
  const isProcessing = useRef(false);

  // Initialize with root question (only once)
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchNextQuestion();
    }
  }, []);

  // Fetch next question from API
  const fetchNextQuestion = async (
    currentDecisions = decisions,
    currentPurpose = appPurpose,
    currentType = appType
  ) => {
    if (isProcessing.current) return; // Prevent double calls
    
    isProcessing.current = true;
    setIsLoading(true);
    
    try {
      console.log('🔍 Fetching next question with:', {
        decisions: currentDecisions,
        appPurpose: currentPurpose,
        appType: currentType
      });

      const response = await fetch('/api/decision-tree/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDecisions: currentDecisions,
          appPurpose: currentPurpose,
          appType: currentType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch question');
      }

      const data = await response.json();

      if (data.completed) {
        // All questions answered!
        handleCompletion();
        return;
      }

      if (data.question) {
        console.log('✅ Next question:', data.question.question);
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
      isProcessing.current = false;
    }
  };

  // Add question node to React Flow with smart S-curve positioning
  const addQuestionToFlow = (question: DecisionNodeType) => {
    const nodeExists = nodes.some(n => n.id === question.id);
    if (nodeExists) return; // Prevent duplicates

    // Calculate position based on progress step
    const step = progress.currentStep - 1; // 0-indexed
    
    // Create a flowing S-curve layout
    let x, y;
    
    if (step === 0) {
      // Root question - center top
      x = 400;
      y = 50;
    } else if (step === 1) {
      // Platform question - slightly below and right
      x = 700;
      y = 150;
    } else {
      // Subsequent questions - flowing path
      const row = Math.floor((step - 2) / 3); // 3 nodes per row
      const col = (step - 2) % 3;
      
      // Alternate direction each row for visual flow
      const isEvenRow = row % 2 === 0;
      const xBase = isEvenRow ? 200 : 800;
      const xDirection = isEvenRow ? 1 : -1;
      
      x = xBase + (col * 300 * xDirection);
      y = 300 + (row * 200);
    }

    const newNode: Node = {
      id: question.id,
      type: 'decision',
      position: { x, y },
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

    // Add flowing edge from previous node
    if (nodes.length > 0) {
      const previousNode = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `e-${previousNode.id}-${question.id}`,
        source: previousNode.id,
        target: question.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }
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
    if (!currentQuestion || isProcessing.current) return;
    
    isProcessing.current = true;
    
    console.log('✅ Choice selected:', choice.label, 'for question:', currentQuestion.id);

    // Update decisions with the selected value
    const newDecisions = {
      ...decisions,
      [currentQuestion.id]: choice.value
    };
    setDecisions(newDecisions);

    // Update app purpose/type if this was root or platform question
    let newAppPurpose = appPurpose;
    let newAppType = appType;
    
    if (currentQuestion.id === 'root') {
      newAppPurpose = choice.value as AppPurpose;
      setAppPurpose(newAppPurpose);
    } else if (currentQuestion.id === 'platform') {
      newAppType = choice.value as AppType;
      setAppType(newAppType);
    }

    // Mark current node as completed and show selected value
    setNodes((nds) =>
      nds.map((node) =>
        node.id === currentQuestion.id
          ? {
              ...node,
              data: {
                ...node.data,
                isClickable: false,
                isCompleted: true,
                selectedValue: choice.label,
                label: currentQuestion.category || currentQuestion.question
              }
            }
          : node
      )
    );

    // Close panel
    setShowChoicePanel(false);

    // Save progress to database (non-blocking)
    saveProgress(newDecisions, newAppPurpose, newAppType).catch(err => 
      console.error('Failed to save progress:', err)
    );

    // Delay before fetching next question to ensure state is updated
    setTimeout(() => {
      isProcessing.current = false;
      fetchNextQuestion(newDecisions, newAppPurpose, newAppType);
    }, 500);
  };

  // Save progress to Supabase
  const saveProgress = async (
    currentDecisions: Record<string, string>,
    currentPurpose?: AppPurpose | null,
    currentType?: AppType | null
  ) => {
    try {
      await fetch('/api/decision-tree/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          appPurpose: currentPurpose || appPurpose,
          appType: currentType || appType,
          decisions: currentDecisions,
          currentStep: progress.currentStep,
          totalSteps: progress.totalSteps
        })
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Handle completion - all questions answered
  const handleCompletion = () => {
    setIsCompleted(true);
    
    // Calculate position for generate button based on S-curve layout
    const step = progress.currentStep - 1;
    const row = Math.floor((step - 2) / 3);
    const col = (step - 2) % 3;
    const isEvenRow = row % 2 === 0;
    
    // Place generate button at the end of the flow
    const generateX = isEvenRow ? 200 + (col * 300) + 300 : 800 - (col * 300) - 300;
    const generateY = 300 + (row * 200);
    
    // Add final "Generate" node
    const generateNode: Node = {
      id: 'generate',
      type: 'decision',
      position: { x: generateX, y: generateY },
      data: {
        label: '🚀 Generate My Custom App!',
        description: 'Click to create your personalized app structure',
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
      const lastNodeInFlow = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `e-${lastNodeInFlow.id}-generate`,
        source: lastNodeInFlow.id,
        target: 'generate',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 4 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    isProcessing.current = false;
  };

  // Generate the final mindmap with all user selections
  const handleGenerate = async () => {
    if (isGenerating || isProcessing.current) return;
    
    setIsGenerating(true);
    
    try {
      console.log('🚀 Generating mindmap with:', { decisions, appPurpose, appType });
      
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
        // Save the mindmap and redirect to project page
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
          // Fallback: redirect to dashboard
          router.push('/dashboard');
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
    <div className="h-screen w-full relative bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
      <div className={`h-full ${progress.currentStep > 0 ? 'pt-36' : ''}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.3,
            minZoom: 0.5,
            maxZoom: 1.5
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.3}
          maxZoom={2}
          className="bg-gradient-to-br from-gray-900 via-black to-purple-900/20"
        >
          <Background 
            color="#4b5563" 
            gap={24}
            variant={BackgroundVariant.Dots}
            className="opacity-30"
          />
          <Controls 
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
          />
        </ReactFlow>
      </div>

      {/* Choice panel */}
      {showChoicePanel && currentQuestion && !isCompleted && (
        <ChoicePanel
          question={currentQuestion}
          onSelect={handleChoiceSelect}
          onClose={() => setShowChoicePanel(false)}
        />
      )}

      {/* Loading overlay */}
      {(isLoading || isGenerating) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl shadow-purple-500/50">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent" />
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl" />
            </div>
            <div className="font-bold text-white text-xl">
              {isGenerating ? '🚀 Generating Your Custom App...' : 'Loading...'}
            </div>
            {isGenerating && (
              <div className="text-gray-400 text-sm text-center max-w-md">
                Creating a personalized mindmap with all your selections, competitor research, and technical stack...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Welcome message when starting */}
      {nodes.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center max-w-3xl">
            <div className="mb-6 animate-rocket-bounce">
              <span className="text-8xl drop-shadow-2xl">🚀</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6 leading-tight">
              Let's Build Your App Together!
            </h1>
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              Answer a few questions and we'll create a <span className="text-purple-400 font-semibold">custom app structure</span> just for you.
            </p>
            <p className="text-lg text-gray-400 mb-10">
              Don't worry - we'll explain everything along the way! 💡
            </p>
            <div className="inline-block animate-bounce">
              <div className="text-4xl drop-shadow-lg">👇</div>
            </div>
            <div className="mt-8 text-sm text-gray-500">
              Your first question will appear in a moment...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
