import React from 'react';
import { AgentTaskResult, AgentMetadata } from '../types';
import { TrendingUp, TrendingDown, Shield, Search, Target, Zap, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AgentResultsPageProps {
  agents: AgentMetadata[];
  results: AgentTaskResult[];
  onBack: () => void;
}

export const AgentResultsPage: React.FC<AgentResultsPageProps> = ({ agents, results, onBack }) => {
  const getTaskIcon = (taskType: AgentTaskResult['taskType']) => {
    switch (taskType) {
      case 'market_research': return <Search className="w-5 h-5" />;
      case 'sentiment_analysis': return <TrendingUp className="w-5 h-5" />;
      case 'security_audit': return <Shield className="w-5 h-5" />;
      case 'price_prediction': return <Target className="w-5 h-5" />;
      case 'arbitrage_scan': return <Zap className="w-5 h-5" />;
      case 'route_optimization': return <TrendingDown className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: AgentTaskResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const getAgentById = (agentId: string) => {
    return agents.find(a => a.id === agentId);
  };

  // Group results by agent
  const resultsByAgent = results.reduce((acc, result) => {
    if (!acc[result.agentId]) {
      acc[result.agentId] = [];
    }
    acc[result.agentId].push(result);
    return acc;
  }, {} as Record<string, AgentTaskResult[]>);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-[#39ff14] text-[#39ff14] rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Grid
        </button>
        
        <h1 className="text-4xl font-bold text-[#39ff14] mb-2">Agent Operations Report</h1>
        <p className="text-gray-400">Real-time results from all active agents</p>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto space-y-8">
        {Object.entries(resultsByAgent).map(([agentId, agentResults]: [string, AgentTaskResult[]]) => {
          const agent = getAgentById(agentId);
          if (!agent) return null;

          return (
            <div key={agentId} className="bg-gray-900 border border-[#39ff14]/30 rounded-xl p-6">
              {/* Agent Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#39ff14] to-green-600 rounded-full flex items-center justify-center text-black font-bold text-xl">
                  {agent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#39ff14]">{agent.name}</h2>
                  <p className="text-gray-400 text-sm">{agent.role} - {agent.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Trust Score</div>
                  <div className="text-2xl font-bold text-[#39ff14]">{agent.trustScore}</div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                {agentResults.map((result, idx) => (
                  <div 
                    key={idx}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-[#39ff14]/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-700 rounded-lg text-[#39ff14]">
                        {getTaskIcon(result.taskType)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white capitalize">
                            {result.taskType.replace('_', ' ')}
                          </h3>
                          {getStatusIcon(result.status)}
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">{result.summary}</p>
                        
                        {/* Task Data */}
                        {result.data && (
                          <div className="bg-gray-900 rounded p-3 mb-3">
                            <pre className="text-xs text-gray-400 overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(result.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(resultsByAgent).length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No Results Yet</h2>
            <p className="text-gray-500">Agents are warming up... Results will appear here soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};
