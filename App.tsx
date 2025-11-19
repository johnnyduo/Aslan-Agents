import React, { useState, useEffect, useCallback } from 'react';
import { AGENTS, INITIAL_LOGS } from './constants';
import { AgentMetadata, LogMessage } from './types';
import WalletBar from './components/WalletBar';
import FlowCanvas from './components/FlowCanvas';
import AgentCard from './components/AgentCard';
import ConsolePanel from './components/ConsolePanel';
import AgentDetailPanel from './components/AgentDetailPanel';

const App: React.FC = () => {
  // --- State ---
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>(INITIAL_LOGS);
  const [streamingEdges, setStreamingEdges] = useState<string[]>([]);

  // --- Handlers ---
  const toggleAgent = (id: string) => {
    setActiveAgents(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
    
    // Add log
    const agent = AGENTS.find(a => a.id === id);
    const isActivating = !activeAgents.includes(id);
    addLog('SYSTEM', `Agent ${agent?.name} ${isActivating ? 'ACTIVATED' : 'DEACTIVATED'} on grid.`);
  };

  const addLog = (type: 'A2A' | 'x402' | 'SYSTEM', content: string) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      content
    };
    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100
  };

  // --- Simulation Loop (The "Life" of the app) ---
  useEffect(() => {
    if (activeAgents.length < 2) {
      setStreamingEdges([]);
      return;
    }

    const interval = setInterval(() => {
      // Random chance to start an event
      const rand = Math.random();

      // 1. A2A Negotiation Event (30% chance)
      if (rand < 0.3) {
        const senderId = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const receiverId = activeAgents.find(id => id !== senderId) || activeAgents[0];
        const sender = AGENTS.find(a => a.id === senderId)!;
        const receiver = AGENTS.find(a => a.id === receiverId)!;

        const messages = [
          `Requesting dataset access for block range #1820000...`,
          `Offer: 0.005 ETH for optimal routing path.`,
          `Verifying SLA contract signature...`,
          `Handshaking with protocol v2.1...`,
          `Querying price oracle for asset pair...`
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        
        addLog('A2A', `[${sender.name} -> ${receiver.name}]: ${msg}`);
      }
      
      // 2. x402 Streaming Event (20% chance to toggle a stream)
      else if (rand > 0.3 && rand < 0.5) {
        // Pick two random agents
        const id1 = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const id2 = activeAgents.find(id => id !== id1);
        
        if (id1 && id2) {
           // Construct edge ID as reactflow does by default: "e-{source}-{target}"
           // But since I don't have the edges in App state, I simulate the visual ID matching.
           // In a real app, I'd query the Edge state. Here I just create a unique key.
           // Let's assume simplified edge matching logic for visual effect.
           // We will just track pairs.
           
           // For this demo, we randomly "pulse" a stream between two active agents if they might be connected
           // Since connections are manual in ReactFlow, we simulate the *system* acknowledging a stream.
           
           const sender = AGENTS.find(a => a.id === id1)!;
           const receiver = AGENTS.find(a => a.id === id2)!;
           
           addLog('x402', `Stream opened: ${sender.name} paying ${receiver.name} @ 340 wei/sec`);
           
           // In a real flow, this would highlight the edge. 
           // I'll pass a list of "active stream pairs" to the canvas.
           // Since I don't know the edge IDs created by ReactFlow, I'll rely on the Canvas to match nodes.
           // Actually, let's just assume edges are created manually by user. 
           // I will simulate "system noise" logs mostly.
        }
      }

    }, 2500);

    return () => clearInterval(interval);
  }, [activeAgents]);

  // --- Render ---
  const selectedAgent = selectedAgentId ? AGENTS.find(a => a.id === selectedAgentId) || null : null;

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-gray-200 overflow-hidden font-sans selection:bg-neon-green selection:text-black">
      <WalletBar />
      
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar: Agent Deck */}
        <div className="w-80 bg-black/40 border-r border-white/10 flex flex-col z-30 backdrop-blur-sm">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-bold text-gray-400 font-mono uppercase tracking-widest">Agent Deck</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {AGENTS.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                isActive={activeAgents.includes(agent.id)}
                onToggle={() => toggleAgent(agent.id)}
                onClick={() => setSelectedAgentId(agent.id)}
              />
            ))}
          </div>
        </div>

        {/* Center: Flow Canvas */}
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
             <FlowCanvas 
                agents={AGENTS} 
                activeAgents={activeAgents}
                streamingEdges={streamingEdges} 
             />
          </div>
          
          {/* Bottom: Console */}
          <div className="h-48 z-30">
            <ConsolePanel logs={logs} />
          </div>
        </div>

        {/* Right Sidebar: Details Panel (Conditional) */}
        <AgentDetailPanel 
          agent={selectedAgent} 
          onClose={() => setSelectedAgentId(null)} 
        />

      </div>
    </div>
  );
};

export default App;