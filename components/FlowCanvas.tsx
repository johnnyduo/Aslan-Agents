import React, { useCallback, useMemo } from 'react';
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
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({ agents, activeAgents, streamingEdges }) => {
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
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#43FF4D' } }, eds)),
    [setEdges]
  );

  // Effect to update node data when props change (simulation updates)
  React.useEffect(() => {
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

    setEdges(eds => eds.map(e => ({
      ...e,
      animated: streamingEdges.includes(e.id),
      style: { 
        stroke: streamingEdges.includes(e.id) ? '#43FF4D' : '#1f2937',
        strokeWidth: streamingEdges.includes(e.id) ? 2 : 1,
        opacity: streamingEdges.includes(e.id) ? 1 : 0.5
      }
    })));
  }, [streamingEdges, activeAgents, setNodes, setEdges]);

  // Re-sync nodes if active agent list changes length significantly (simple approach)
  React.useEffect(() => {
     if (nodes.length !== activeAgents.length) {
         const newNodes = activeAgents.map((id, index) => {
            const existingNode = nodes.find(n => n.id === id);
            const agent = agents.find(a => a.id === id)!;
            if (existingNode) return existingNode;
            return {
                id: agent.id,
                type: 'agentNode',
                position: { x: Math.random() * 600, y: Math.random() * 400 },
                data: { agent, isStreaming: false, currentAction: 'Booting...' }
            };
         });
         setNodes(newNodes);
     }
  }, [activeAgents, agents, nodes, setNodes]);

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