import React, { useState, useEffect } from 'react';
import { X, DollarSign, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useX402Withdraw, useX402StreamData, useX402WithdrawableBalance } from '../hooks/useX402Deposit';
import { formatUnits } from 'viem';
import { toast } from 'react-toastify';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  captainAgentId: number;
  connectedAgents: Array<{agentId: string, tokenId: bigint}>; // Agents connected to Captain
  onWithdrawSuccess?: () => void;
}

interface StreamWithBalance {
  streamId: number;
  owedAmount: bigint | undefined;
  receiverAgentId: number | undefined;
  isActive: boolean | undefined;
  isLoading: boolean;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  captainAgentId,
  connectedAgents,
  onWithdrawSuccess
}) => {
  const { address, isConnected } = useAccount();
  const { withdraw, isPending, isSuccess, hash, error } = useX402Withdraw();

  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);
  const [step, setStep] = useState<'list' | 'withdrawing' | 'success'>('list');
  const [userStreams, setUserStreams] = useState<number[]>([]);
  const [streamsWithBalances, setStreamsWithBalances] = useState<StreamWithBalance[]>([]);

  // Load user's created streams from localStorage
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('userStreams');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const streamIds = Array.isArray(parsed) ? parsed : [];
          setUserStreams(streamIds);
          
          // Fetch balances for all streams
          const fetchBalances = async () => {
            const balances: StreamWithBalance[] = [];
            for (const id of streamIds) {
              balances.push({
                streamId: id,
                owedAmount: undefined,
                receiverAgentId: undefined,
                isActive: undefined,
                isLoading: true
              });
            }
            setStreamsWithBalances(balances);
          };
          fetchBalances();
        } catch (err) {
          console.error('Error loading streams:', err);
        }
      }
    }
  }, [isOpen]);

  // Handle successful withdrawal
  useEffect(() => {
    if (isSuccess && hash && step === 'withdrawing') {
      setStep('success');
      
      const explorerUrl = `https://hashscan.io/testnet/transaction/${hash}`;
      
      // Show success toast with explorer link
      toast.success(
        <div>
          <div className="font-bold">✅ Withdrawal Successful!</div>
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-green hover:underline text-sm"
          >
            View on Hedera Explorer →
          </a>
          <div className="text-xs text-gray-400 mt-1 truncate">Tx: {hash.slice(0, 10)}...{hash.slice(-8)}</div>
        </div>,
        { autoClose: 8000 }
      );

      // Call success callback
      if (onWithdrawSuccess) {
        onWithdrawSuccess();
      }
    }
  }, [isSuccess, hash, step, onWithdrawSuccess]);

  // Handle errors
  useEffect(() => {
    if (error && step !== 'form') {
      toast.error(
        <div>
          <div className="font-bold">❌ Withdrawal Failed</div>
          <div className="text-sm">{error.message || 'Please try again'}</div>
        </div>,
        { autoClose: 5000 }
      );
      setStep('form');
    }
  }, [error, step]);

  if (!isOpen) return null;

  const handleWithdrawFromStream = async (streamId: number) => {
    setSelectedStreamId(streamId);
    setStep('withdrawing');
    
    try {
      toast.info('⏳ Withdrawing from stream...');
      await withdraw(streamId);
    } catch (err) {
      console.error('Withdrawal failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`❌ Withdrawal failed: ${errorMsg}`);
      setStep('list');
      setSelectedStreamId(null);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !address) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    if (!streamId || parseInt(streamId) <= 0) {
      toast.error('❌ Please enter a valid stream ID');
      return;
    }

    if (!receiverAgentId || receiverAgentId === 0) {
      toast.error('❌ Please select the receiver agent (who will withdraw)');
      return;
    }

    // Validate that selected receiver is either Captain or a connected agent
    const isValidReceiver = receiverAgentId === captainAgentId || 
      connectedAgents.some(agent => Number(agent.tokenId) === receiverAgentId);
    
    if (!isValidReceiver) {
      toast.error('❌ Selected agent is not connected or not owned by you');
      return;
    }

    // Validate that the selected receiver matches the stream's receiver
    if (streamDataWithBalance && Array.isArray(streamDataWithBalance) && streamDataWithBalance.length > 0) {
      const streamReceiverId = Number(streamDataWithBalance[1]);
      if (streamReceiverId !== receiverAgentId) {
        toast.error(`❌ Stream receiver is Agent #${streamReceiverId}, but you selected Agent #${receiverAgentId}. Please select the correct receiver.`);
        return;
      }
    }

    try {
      setStep('withdrawing');
      toast.info('⏳ Withdrawing from stream...');
      await withdraw(parseInt(streamId));
    } catch (err) {
      console.error('Withdrawal failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`❌ Withdrawal failed: ${errorMsg}`);
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setStreamId('');
    setReceiverAgentId(0);
    onClose();
  };

  // Format stream balance
  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return '0';
    return formatUnits(balance, decimals);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-neon-green rounded-lg w-full max-w-md shadow-2xl shadow-neon-green/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neon-green/30">
          <div className="flex items-center gap-2">
            <TrendingDown size={20} className="text-neon-green" />
            <h2 className="text-lg font-bold text-white font-mono">WITHDRAW FUNDS</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isPending}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'form' && (
            <>
              {/* Connected Agents Info */}
              {captainAgentId === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-xs text-gray-300 space-y-2">
                  <p className="text-red-400 font-bold">⚠️ CAPTAIN NOT REGISTERED!</p>
                  <p>Please activate the Captain agent first to withdraw funds.</p>
                </div>
              ) : connectedAgents.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-xs text-gray-300 space-y-2">
                  <p className="text-yellow-400 font-bold">⚠️ No Connected Agents</p>
                  <p>You can only withdraw from streams where you own the receiver agent.</p>
                  <p className="text-gray-400">Captain can withdraw, or connect other agents to withdraw on their behalf.</p>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-xs text-gray-300 space-y-2">
                  <p className="text-green-400 font-bold">✅ {connectedAgents.length + 1} Agent{connectedAgents.length > 0 ? 's' : ''} Available</p>
                  <p>💡 Withdraw accumulated payments from an active x402 stream. Only the receiver can withdraw.</p>
                </div>
              )}

              {/* Receiver Agent Selection */}
              {captainAgentId !== 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400">RECEIVER AGENT (Who can withdraw?)</label>
                  <select
                    value={receiverAgentId}
                    onChange={(e) => setReceiverAgentId(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded font-mono text-sm focus:outline-none focus:border-neon-green"
                  >
                    <option value={0}>Select receiver agent...</option>
                    <option value={captainAgentId}>Captain Aslan (Token #{captainAgentId})</option>
                    {connectedAgents.map(({agentId, tokenId}) => {
                      const agentNames: Record<string, string> = {
                        'a1': 'Eagleton (Navigator)',
                        'a2': 'Liora (Analyst)',
                        'a3': 'Reynard (Trader)',
                        'a4': 'Mara (Guardian)',
                        'a5': 'Kairos (Oracle)',
                        'a6': 'Sylph (Messenger)'
                      };
                      return (
                        <option key={agentId} value={Number(tokenId)}>
                          {agentNames[agentId] || agentId} (Token #{tokenId.toString()})
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-gray-500">Only the receiver agent owner can withdraw funds</p>
                </div>
              )}

              {/* Stream ID Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">STREAM ID</label>
                <input
                  type="number"
                  value={streamId}
                  onChange={(e) => setStreamId(e.target.value)}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white font-mono focus:border-neon-green focus:outline-none"
                  placeholder="Enter stream ID..."
                />
                
                {/* Quick Select - Your Created Streams */}
                {userStreams.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded p-3 space-y-2">
                    <p className="text-xs font-mono text-gray-400">💡 YOUR CREATED STREAMS:</p>
                    <div className="flex flex-wrap gap-2">
                      {userStreams.slice(-5).reverse().map((id) => (
                        <button
                          key={id}
                          onClick={() => setStreamId(String(id))}
                          className={`px-3 py-1 rounded font-mono text-sm transition-all ${
                            streamId === String(id)
                              ? 'bg-neon-green text-black'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          #{id}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Click to quick-select a stream ID</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">The ID of the x402 payment stream (from deposit receipt)</p>
              </div>

              {/* Stream Info with Withdrawable Balance */}
              {streamId && !isLoadingBalance && !isLoadingStream && (
                <div className="space-y-3">
                  {/* Withdrawable Amount - Always show if we have the amount */}
                  {typeof owedAmount === 'bigint' && (
                    <div className={`border-2 rounded-lg p-4 ${
                      owedAmount > 0n 
                        ? 'bg-gradient-to-r from-neon-green/20 to-green-500/20 border-neon-green' 
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono text-gray-400 mb-1">
                            {owedAmount > 0n ? 'WITHDRAWABLE NOW' : 'CURRENT BALANCE'}
                          </p>
                          <p className={`text-2xl font-bold font-mono ${
                            owedAmount > 0n ? 'text-neon-green' : 'text-yellow-400'
                          }`}>
                            {formatBalance(owedAmount)} {streamDataWithBalance && streamDataWithBalance[2] === '0x0000000000000000000000000000000000000000' ? 'HBAR' : streamDataWithBalance ? 'USDC' : 'HBAR'}
                          </p>
                        </div>
                        <DollarSign className={`w-10 h-10 opacity-50 ${
                          owedAmount > 0n ? 'text-neon-green' : 'text-yellow-400'
                        }`} />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 font-mono">
                        {owedAmount > 0n 
                          ? '💰 Available to withdraw immediately' 
                          : '⏳ Balance accumulating... check back later'}
                      </p>
                    </div>
                  )}

                  {/* Stream Details - Only show if we have full stream data */}
                  {streamDataWithBalance && Array.isArray(streamDataWithBalance) && streamDataWithBalance.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-mono">Stream Status:</span>
                        <span className={`font-mono font-bold ${streamDataWithBalance[8] ? 'text-gray-500' : 'text-neon-green'}`}>
                          {streamDataWithBalance[8] ? '⚫ CLOSED' : '🟢 ACTIVE'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-mono">Total Paid:</span>
                        <span className="text-white font-mono">
                          {formatBalance(streamDataWithBalance[5] as bigint)} {streamDataWithBalance[2] === '0x0000000000000000000000000000000000000000' ? 'HBAR' : 'USDC'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-mono">Rate per Second:</span>
                        <span className="text-white font-mono">
                          {formatBalance(streamDataWithBalance[3] as bigint)} {streamDataWithBalance[2] === '0x0000000000000000000000000000000000000000' ? 'HBAR' : 'USDC'}/s
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-mono">Spending Cap:</span>
                        <span className="text-white font-mono">
                          {formatBalance(streamDataWithBalance[4] as bigint)} {streamDataWithBalance[2] === '0x0000000000000000000000000000000000000000' ? 'HBAR' : 'USDC'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-mono">Sender Agent:</span>
                        <span className="text-white font-mono">
                          #{streamDataWithBalance[0]?.toString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-mono">Receiver Agent:</span>
                        <span className="text-neon-green font-mono font-bold">
                          #{streamDataWithBalance[1]?.toString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(isLoadingBalance || isLoadingStream) && streamId && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-neon-green" size={24} />
                  <span className="ml-2 text-sm text-gray-400">Loading stream data...</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleWithdraw}
                disabled={
                  !isConnected || 
                  !streamId || 
                  parseInt(streamId) <= 0 || 
                  !receiverAgentId || 
                  receiverAgentId === 0 || 
                  isLoadingStream || 
                  isLoadingBalance ||
                  captainAgentId === 0 ||
                  (typeof owedAmount === 'bigint' && owedAmount === 0n)
                }
                className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-bold font-mono py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <TrendingDown size={16} />
                {captainAgentId === 0 
                  ? 'ACTIVATE CAPTAIN FIRST' 
                  : !receiverAgentId 
                  ? 'SELECT RECEIVER' 
                  : !streamId
                  ? 'ENTER STREAM ID'
                  : typeof owedAmount === 'bigint' && owedAmount === 0n
                  ? 'NO FUNDS TO WITHDRAW'
                  : 'WITHDRAW FUNDS'}
              </button>

              {!isConnected && (
                <p className="text-center text-xs text-red-400 font-mono">⚠️ Connect wallet to continue</p>
              )}
            </>
          )}

          {step === 'withdrawing' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
                <TrendingDown size={32} className="text-neon-green animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Withdrawing...</h3>
              <p className="text-sm text-gray-400">
                Processing withdrawal from stream #{streamId}
              </p>
              <div className="animate-spin w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
                <DollarSign size={32} className="text-neon-green" />
              </div>
              <h3 className="text-lg font-bold text-neon-green font-mono">✅ WITHDRAWAL COMPLETE!</h3>
              <p className="text-sm text-gray-400">
                Funds successfully withdrawn from stream #{streamId}
              </p>
              {hash && (
                <a
                  href={`https://hashscan.io/testnet/transaction/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neon-green hover:underline font-mono"
                >
                  View on HashScan →
                </a>
              )}
              <button
                onClick={handleClose}
                className="mt-4 bg-gray-800 hover:bg-gray-700 text-white font-mono px-6 py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-xs text-red-400 font-mono">
              ❌ Error: {(error as any)?.message || 'Transaction failed'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
