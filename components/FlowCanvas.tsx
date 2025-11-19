import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import { AgentMetadata } from '../types';

// --- Custom Agent Node ---
const AgentNode = ({ data }: NodeProps) => {
  const { agent } = data;
  const spriteUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${agent.spriteSeed}&backgroundColor=transparent`;

  return (
    <div className={`
      relative w-32 flex flex-col items-center 
      ${data.isStreaming ? 'filter drop-shadow-[0_0_10px_#43FF4D]' : ''}
    `}>
      <Handle type="target" position={Position.Top} className="!bg-neon-green !w-3 !h-3 !border-none" />
      
      <div className="relative w-20 h-20 mb-2">
        {/* Status Ring */}
        <div className={`
          absolute inset-0 rounded-full border-2 border-dashed 
          ${data.isStreaming ? 'border-neon-green animate-spin-slow' : 'border-white/20'}
        `}></div>
        
        <img 
          src={spriteUrl} 
          alt={agent.name}
          className="w-full h-full object-contain p-2"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      <div className="bg-black/80 backdrop-blur border border-neon-green/50 px-3 py-1 rounded-md text-center min-w-[120px]">
        <div className="text-[10px] text-neon-green font-mono uppercase font-bold truncate">{agent.name}</div>
        {data.currentAction && (
          <div className="text-[9px] text-white/70 truncate animate-pulse">{data.currentAction}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-neon-green !w-3 !h-3 !border-none" />
      
      {/* x402 Stream Badge */}
      {data.isStreaming && (
        <div className="absolute -right-4 top-0 bg-neon-green text-black text-[8px] font-bold px-1 rounded animate-bounce">
          x402
        </div>
      )}
    </div>
  );
};

interface FlowCanvasProps {
  agents: AgentMetadata[];
  activeAgents: string[];
  streamingEdges: string[]; // list of edge IDs that are streaming
  onNodePositionsChange?: (positions: Record<string, { x: number; y: number }>) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({ agents, activeAgents, streamingEdges, onNodePositionsChange }) => {
  const nodeTypes = useMemo(() => ({ agentNode: AgentNode }), []);

  // Convert active agents to Nodes
  const initialNodes: Node[] = useMemo(() => {
    return activeAgents.map((id, index) => {
      const agent = agents.find(a => a.id === id)!;
      return {
        id: agent.id,
        type: 'agentNode',
        position: { x: 100 + (index * 250), y: 100 + (index % 2) * 150 },
        data: { 
          agent,
          isStreaming: false, // Will be updated dynamically via simulation
          currentAction: 'Idling...'
        },
      };
    });
  }, [activeAgents, agents]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      animated: true, 
      type: 'default', // Use default for smooth bezier curves
      style: { 
        stroke: '#43FF4D',
        strokeWidth: 3,
        strokeDasharray: '5,5',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#43FF4D',
      },
    }, eds)),
    [setEdges]
  );

  // Effect to update node data when props change (simulation updates)
  useEffect(() => {
    setNodes((nds) => 
      nds.map((node) => {
        // Find if this node is part of a streaming edge
        const isSource = streamingEdges.some(edgeId => edgeId.startsWith(node.id));
        const isTarget = streamingEdges.some(edgeId => edgeId.endsWith(node.id));
        return {
          ...node,
          data: {
            ...node.data,
            isStreaming: isSource || isTarget,
            currentAction: isSource ? 'Streaming x402...' : isTarget ? 'Receiving Service' : 'Idling...'
          }
        };
      })
    );

    setEdges(eds => eds.map(e => {
      const isStreaming = streamingEdges.includes(e.id);
      return {
        ...e,
        animated: isStreaming,
        className: isStreaming ? 'streaming-flow' : '',
        type: 'default', // Bezier curves for smooth connections
        style: { 
          stroke: isStreaming ? '#43FF4D' : '#1f2937',
          strokeWidth: isStreaming ? 4 : 2,
          strokeDasharray: isStreaming ? '10,5' : '5,5',
          opacity: isStreaming ? 1 : 0.6,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: isStreaming ? 24 : 18,
          height: isStreaming ? 24 : 18,
          color: isStreaming ? '#43FF4D' : '#1f2937',
        }
      };
    }));
  }, [streamingEdges, activeAgents, setNodes, setEdges]);

  // Re-sync nodes if active agent list changes length significantly (simple approach)
  useEffect(() => {
     if (nodes.length !== activeAgents.length) {
         const newNodes = activeAgents.map((id, index) => {
            const existingNode = nodes.find(n => n.id === id);
            const agent = agents.find(a => a.id === id)!;
            if (existingNode) return existingNode;
            return {
                id: agent.id,
                type: 'agentNode',
                position: { 
                  x: 150 + (index * 200) + (Math.random() * 50 - 25), 
                  y: 150 + ((index % 2) * 200) + (Math.random() * 50 - 25) 
                },
                data: { agent, isStreaming: false, currentAction: 'Booting...' }
            };
         });
         setNodes(newNodes);
     }
  }, [activeAgents, agents, nodes, setNodes]);

  // Report node positions to parent for dialogue placement
  useEffect(() => {
    if (onNodePositionsChange && nodes.length > 0) {
      const positions: Record<string, { x: number; y: number }> = {};
      nodes.forEach(node => {
        positions[node.id] = { x: node.position.x, y: node.position.y };
      });
      onNodePositionsChange(positions);
    }
  }, [nodes, onNodePositionsChange]);

  return (
    <div className="w-full h-full bg-[#050505] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-black"
      >
        <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            color="#1f2937" 
        />
        <Controls className="bg-black border border-white/20 fill-white" />
      </ReactFlow>
      
      {activeAgents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h2 className="text-2xl font-mono text-white/30 font-bold">GRID OFFLINE</h2>
            <p className="text-neon-green/50 text-sm font-mono mt-2">Activate agents to begin orchestration</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas;