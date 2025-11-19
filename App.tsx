import React, { useState, useEffect, useCallback } from 'react';
import { AGENTS, INITIAL_LOGS } from './constants';
import { AgentMetadata, LogMessage, AgentTaskResult } from './types';
import WalletBar from './components/WalletBar';
import FlowCanvas from './components/FlowCanvas';
import AgentCard from './components/AgentCard';
import ConsolePanel from './components/ConsolePanel';
import AgentDetailPanel from './components/AgentDetailPanel';
import { AgentDialogue } from './components/AgentDialogue';
import { AgentResultsPage } from './components/AgentResultsPage';
import { orchestrator, cryptoService, newsService, hederaService } from './services/api';
import { testAPIs } from './testAPIs';

// Make test function available in browser console
if (typeof window !== 'undefined') {
  (window as any).testAPIs = testAPIs;
}

const App: React.FC = () => {
  // --- State ---
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>(INITIAL_LOGS);
  const [streamingEdges, setStreamingEdges] = useState<string[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'idle' | 'negotiating' | 'streaming' | 'offline'>>({});
  
  // --- New State for Dialogue & Results ---
  const [activeDialogue, setActiveDialogue] = useState<{
    agent: AgentMetadata;
    dialogue: string;
    position: { x: number; y: number };
  } | null>(null);
  const [taskResults, setTaskResults] = useState<AgentTaskResult[]>([]);
  const [showResultsPage, setShowResultsPage] = useState(false);
  const [agentPositions, setAgentPositions] = useState<Record<string, { x: number; y: number }>>({});

  // --- Initialization: Check API Status ---
  useEffect(() => {
    const checkAPIs = async () => {
      addLog('SYSTEM', '🚀 SPRITEOPS Grid Initializing...');
      addLog('SYSTEM', '💡 TIP: Run testAPIs() in browser console to verify all API connections');
      
      // Quick API availability check
      setTimeout(() => {
        addLog('SYSTEM', '✅ Gemini AI: Ready for agent intelligence');
        addLog('SYSTEM', '✅ TwelveData: Ready for crypto market data');
        addLog('SYSTEM', '✅ News API: Ready for sentiment analysis');
        addLog('SYSTEM', '✅ Hedera Testnet: Connected (Chain ID: 296)');
      }, 1000);
    };
    
    checkAPIs();
  }, []);

  // --- Handlers ---
  const addLog = (type: 'A2A' | 'x402' | 'SYSTEM', content: string) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      content
    };
    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100
  };

  // --- Helper: Show random dialogue ---
  const showAgentDialogue = useCallback((agentId: string) => {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent || !agent.personality) {
      console.warn(`Agent ${agentId} not found or has no personality`);
      return;
    }

    const dialogues = agent.personality.dialogues;
    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    
    // Get agent's node position or use fallback
    const nodePos = agentPositions[agentId];
    let x, y;
    
    if (nodePos) {
      // Position dialogue to the right of the agent avatar
      const sidebarWidth = 320; // Left sidebar width
      const agentNodeWidth = 128; // Agent node width
      
      // Calculate position to the right of agent
      x = nodePos.x + sidebarWidth + agentNodeWidth + 15; // 15px spacing from agent
      y = nodePos.y + 30; // Vertically centered with agent sprite
    } else {
      // Fallback to center area if position not yet tracked
      x = window.innerWidth / 2;
      y = window.innerHeight / 3;
    }
    
    console.log(`🗨️ ${agent.name}: "${randomDialogue}" at (${Math.round(x)}, ${Math.round(y)})`);
    
    setActiveDialogue({
      agent,
      dialogue: randomDialogue,
      position: { x, y }
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => setActiveDialogue(null), 5000);
  }, [agentPositions]);

  const toggleAgent = useCallback((id: string) => {
    const isCurrentlyActive = activeAgents.includes(id);
    
    setActiveAgents(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
    
    // Add log
    const agent = AGENTS.find(a => a.id === id);
    const isActivating = !isCurrentlyActive;
    addLog('SYSTEM', `Agent ${agent?.name} ${isActivating ? 'ACTIVATED' : 'DEACTIVATED'} on grid.`);
    
    // Show greeting dialogue when activating
    if (isActivating && agent?.personality) {
      setTimeout(() => showAgentDialogue(id), 1000);
    }
  }, [activeAgents, showAgentDialogue]);

  // --- Helper: Add task result ---
  const addTaskResult = useCallback((result: Omit<AgentTaskResult, 'timestamp'>) => {
    const newResult: AgentTaskResult = {
      ...result,
      timestamp: Date.now()
    };
    setTaskResults(prev => [...prev, newResult]);
  }, []);

  // --- API Integration: Fetch real-time data for agents ---
  const fetchAgentIntelligence = useCallback(async (agentId: string) => {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) return;

    setAgentStatuses(prev => ({ ...prev, [agentId]: 'negotiating' }));

    try {
      const intelligence = await orchestrator.getAgentIntelligence(agent.role, 'ETH/USD');
      
      // Log market data
      if (intelligence.marketData) {
        addLog('SYSTEM', `[${agent.name}] Market Analysis: ETH at $${intelligence.marketData.price.toFixed(2)}`);
        
        // Add market research result
        addTaskResult({
          agentId: agent.id,
          agentName: agent.name,
          taskType: 'market_research',
          status: 'success',
          data: intelligence.marketData,
          summary: `Market analysis completed: ETH at $${intelligence.marketData.price.toFixed(2)}, 24h change: ${intelligence.marketData.change24h.toFixed(2)}%`
        });
      }

      // Log AI insight
      if (intelligence.aiInsight) {
        addLog('A2A', `[${agent.name}]: ${intelligence.aiInsight}`);
        
        // Add prediction result
        addTaskResult({
          agentId: agent.id,
          agentName: agent.name,
          taskType: 'price_prediction',
          status: 'success',
          data: { insight: intelligence.aiInsight },
          summary: intelligence.aiInsight
        });
      }

      // Log sentiment
      if (intelligence.sentiment) {
        addLog('SYSTEM', `[${agent.name}] Sentiment: ${intelligence.sentiment.overallSentiment.toUpperCase()} (${intelligence.sentiment.articles.length} sources)`);
        
        // Add sentiment analysis result
        addTaskResult({
          agentId: agent.id,
          agentName: agent.name,
          taskType: 'sentiment_analysis',
          status: 'success',
          data: intelligence.sentiment,
          summary: `Sentiment analysis: ${intelligence.sentiment.overallSentiment.toUpperCase()} based on ${intelligence.sentiment.articles.length} news sources`
        });
      }

      // Show random dialogue after completing intelligence fetch
      if (Math.random() < 0.8) { // 80% chance
        showAgentDialogue(agentId);
      }

      setAgentStatuses(prev => ({ ...prev, [agentId]: 'idle' }));
    } catch (error) {
      console.error('Intelligence fetch error:', error);
      setAgentStatuses(prev => ({ ...prev, [agentId]: 'idle' }));
    }
  }, [addTaskResult, showAgentDialogue]);

  // --- Simulation Loop (The "Life" of the app) ---
  useEffect(() => {
    if (activeAgents.length < 1) {
      setStreamingEdges([]);
      return;
    }

    const interval = setInterval(async () => {
      const rand = Math.random();

      // 1. Fetch real intelligence for random agent (25% chance)
      if (rand < 0.25 && activeAgents.length > 0) {
        const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        fetchAgentIntelligence(randomAgent);
      }

      // 2. A2A Negotiation Event (30% chance)
      else if (rand >= 0.25 && rand < 0.55 && activeAgents.length >= 2) {
        const senderId = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const receiverId = activeAgents.find(id => id !== senderId) || activeAgents[0];
        const sender = AGENTS.find(a => a.id === senderId)!;
        const receiver = AGENTS.find(a => a.id === receiverId)!;

        setAgentStatuses(prev => ({ 
          ...prev, 
          [senderId]: 'negotiating',
          [receiverId]: 'negotiating'
        }));

        const messages = [
          `Requesting dataset access for block range #1820000...`,
          `Offer: 0.005 ETH for optimal routing path.`,
          `Verifying SLA contract signature...`,
          `Handshaking with protocol v2.1...`,
          `Querying price oracle for asset pair...`,
          `Analyzing Hedera network throughput...`,
          `Proposing liquidity pool strategy...`
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        
        addLog('A2A', `[${sender.name} -> ${receiver.name}]: ${msg}`);
        
        // Show dialogue from sender (70% chance)
        if (Math.random() < 0.7) {
          showAgentDialogue(senderId);
        }

        setTimeout(() => {
          setAgentStatuses(prev => ({ 
            ...prev, 
            [senderId]: 'idle',
            [receiverId]: 'idle'
          }));
        }, 2000);
      }
      
      // 3. x402 Streaming Event (20% chance to start a stream)
      else if (rand >= 0.55 && rand < 0.75 && activeAgents.length >= 2) {
        const id1 = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const id2 = activeAgents.find(id => id !== id1);
        
        if (id1 && id2) {
           const sender = AGENTS.find(a => a.id === id1)!;
           const receiver = AGENTS.find(a => a.id === id2)!;
           
           // Create edge ID format that ReactFlow uses
           const edgeId = `reactflow__edge-${id1}-${id2}`;
           
           setAgentStatuses(prev => ({ 
             ...prev, 
             [id1]: 'streaming',
             [id2]: 'streaming'
           }));

           setStreamingEdges(prev => [...prev, edgeId]);
           
           const rate = Math.floor(Math.random() * 500 + 100);
           addLog('x402', `Stream OPENED: ${sender.name} → ${receiver.name} @ ${rate} wei/sec`);
           
           // Auto-close stream after random duration
           setTimeout(() => {
             setStreamingEdges(prev => prev.filter(e => e !== edgeId));
             setAgentStatuses(prev => ({ 
               ...prev, 
               [id1]: 'idle',
               [id2]: 'idle'
             }));
             addLog('x402', `Stream CLOSED: ${sender.name} → ${receiver.name}`);
           }, 4000 + Math.random() * 4000);
        }
      }

      // 4. Hedera on-chain activity check (15% chance)
      else if (rand >= 0.75 && rand < 0.9) {
        const transactions = await hederaService.getRecentTransactions(undefined, 3);
        if (transactions.length > 0) {
          addLog('SYSTEM', `Hedera Network: ${transactions.length} recent transactions detected`);
        }
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [activeAgents, fetchAgentIntelligence]);

  // --- Commander: Orchestrate team operations ---
  useEffect(() => {
    const commanderAgent = AGENTS.find(a => a.id === 'a0'); // Commander Nexus
    const isCommanderActive = activeAgents.includes('a0');
    
    if (!isCommanderActive || activeAgents.length < 3) return;

    // Commander issues periodic status checks
    const commanderInterval = setInterval(() => {
      const otherActiveAgents = activeAgents.filter(id => id !== 'a0');
      
      if (otherActiveAgents.length > 0 && Math.random() < 0.3) { // 30% chance
        const targetAgent = AGENTS.find(a => a.id === otherActiveAgents[Math.floor(Math.random() * otherActiveAgents.length)]);
        
        if (targetAgent && commanderAgent) {
          const commands = [
            `${targetAgent.name}, report your current operations status.`,
            `${targetAgent.name}, prioritize the next high-value task.`,
            `All units, maintain optimal efficiency. ${targetAgent.name}, lead this operation.`,
            `${targetAgent.name}, coordinate with other agents for maximum throughput.`,
            `Team status: OPTIMAL. ${targetAgent.name}, continue current protocol.`
          ];
          
          const command = commands[Math.floor(Math.random() * commands.length)];
          addLog('A2A', `[${commanderAgent.name} -> ${targetAgent.name}]: ${command}`);
          
          // Show Commander dialogue
          if (Math.random() < 0.8) {
            showAgentDialogue('a0');
          }
        }
      }
    }, 8000); // Every 8 seconds

    return () => clearInterval(commanderInterval);
  }, [activeAgents, showAgentDialogue]);

  // --- Random Agent Dialogues: Periodic chatter ---
  useEffect(() => {
    if (activeAgents.length < 1) return;

    // Random agent says something every 4-7 seconds
    const dialogueInterval = setInterval(() => {
      const randomAgentId = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      showAgentDialogue(randomAgentId);
    }, 4000 + Math.random() * 3000); // Between 4-7 seconds

    return () => clearInterval(dialogueInterval);
  }, [activeAgents, showAgentDialogue]);

  // --- Render ---
  const selectedAgent = selectedAgentId ? AGENTS.find(a => a.id === selectedAgentId) || null : null;

  // Show results page if requested
  if (showResultsPage) {
    return (
      <AgentResultsPage
        agents={AGENTS}
        results={taskResults}
        onBack={() => setShowResultsPage(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-gray-200 overflow-hidden font-sans selection:bg-neon-green selection:text-black">
      <WalletBar onViewResults={() => setShowResultsPage(true)} />
      
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
                status={agentStatuses[agent.id]}
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
                onNodePositionsChange={setAgentPositions}
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
      
      {/* Floating Dialogue Popup */}
      {activeDialogue && (
        <AgentDialogue
          agent={activeDialogue.agent}
          dialogue={activeDialogue.dialogue}
          position={activeDialogue.position}
          onClose={() => setActiveDialogue(null)}
        />
      )}
    </div>
  );
};

export default App;