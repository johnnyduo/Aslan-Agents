import React, { useState, useEffect } from 'react';
import { X, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useX402Deposit } from '../hooks/useX402Deposit';
import { formatUnits } from 'viem';
import { toast } from 'react-toastify';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  captainAgentId: number;
  connectedAgents: Array<{agentId: string, tokenId: bigint}>; // Agents connected to Captain
  onDepositSuccess?: (streamId: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  captainAgentId,
  connectedAgents,
  onDepositSuccess
}) => {
  const { address, isConnected } = useAccount();
  const { deposit, approveUSDC, isApproving, isDepositing, isSuccess, isApproveSuccess, streamHash, error, streamReceipt } = useX402Deposit();

  const [amount, setAmount] = useState('1000');
  const [asset, setAsset] = useState<'HBAR' | 'USDC'>('USDC'); // Default to USDC since contract only accepts ERC20
  const [ratePerSecond, setRatePerSecond] = useState('0.00001');
  const [receiverAgentId, setReceiverAgentId] = useState<number>(0);
  const [createdStreamId, setCreatedStreamId] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'approve' | 'deposit' | 'success'>('form');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setAmount('1000');
      setRatePerSecond('0.00001');
      setReceiverAgentId(0);
      setCreatedStreamId(null);
    }
  }, [isOpen]);

  // Handle successful deposit and parse stream ID from logs
  useEffect(() => {
    if (isSuccess && streamHash && step === 'deposit' && streamReceipt) {
      // Parse StreamOpened event to get streamId
      let parsedStreamId: string | null = null;
      
      try {
        // StreamOpened event signature: StreamOpened(uint256 indexed streamId, uint256 indexed senderAgentId, uint256 indexed receiverAgentId, address asset, uint256 ratePerSecond, uint256 spendingCap)
        const streamOpenedTopic = '0x0edde3241ad68cd979eb9449c1e3d81bbef9eee85a02fefe8a2eaed04888231d';
        
        if (streamReceipt.logs && streamReceipt.logs.length > 0) {
          // Find the StreamOpened event log
          const streamLog = streamReceipt.logs.find(log => 
            log.topics && log.topics[0] && log.topics[0].toLowerCase() === streamOpenedTopic.toLowerCase()
          );
          
          if (streamLog && streamLog.topics && streamLog.topics.length > 1) {
            // First topic is event signature, second is streamId (first indexed param)
            // Use BigInt to handle large uint256 values, then convert to string
            const streamIdBigInt = BigInt(streamLog.topics[1]);
            parsedStreamId = streamIdBigInt.toString();
          } else {
            console.warn('StreamOpened event not found in logs');
          }
        }
      } catch (err) {
        console.error('Error parsing stream ID:', err);
      }

      if (parsedStreamId) {
        setCreatedStreamId(parsedStreamId);
        
        // Store in localStorage for withdrawal reference
        const existingStreams = JSON.parse(localStorage.getItem('userStreams') || '[]');
        if (!existingStreams.includes(parsedStreamId)) {
          existingStreams.push(parsedStreamId);
          localStorage.setItem('userStreams', JSON.stringify(existingStreams));
        }
      }

      setStep('success');
      
      const explorerUrl = `https://hashscan.io/testnet/transaction/${streamHash}`;
      
      // Show success toast with explorer link and stream ID
      toast.success(
        <div>
          <div className="font-bold">✅ Stream Opened Successfully!</div>
          {parsedStreamId && <div className="text-sm font-mono">Stream ID: #{parsedStreamId}</div>}
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-green hover:underline text-sm"
          >
            View on Hedera Explorer →
          </a>
          <div className="text-xs text-gray-400 mt-1 truncate">Tx: {streamHash.slice(0, 10)}...{streamHash.slice(-8)}</div>
        </div>,
        { autoClose: 10000 }
      );

      // Call success callback with actual stream ID
      if (onDepositSuccess && parsedStreamId) {
        onDepositSuccess(parsedStreamId);
      }
    }
  }, [isSuccess, streamHash, step, streamReceipt, onDepositSuccess]);

  // When approval succeeds, automatically proceed to deposit
  useEffect(() => {
    if (isApproveSuccess && step === 'approve') {
      // Silently proceed to deposit - no toast needed, MetaMask handled the UI
      setStep('deposit');
      
      // Trigger deposit
      deposit({
        amount,
        asset,
        senderAgentId: captainAgentId,
        receiverAgentId: receiverAgentId,
        ratePerSecond
      });
    }
  }, [isApproveSuccess, step, amount, asset, captainAgentId, receiverAgentId, ratePerSecond, deposit]);

  // Handle errors
  useEffect(() => {
    if (error && step !== 'form') {
      toast.error(
        <div>
          <div className="font-bold">❌ Transaction Failed</div>
          <div className="text-sm">{error.message || 'Please try again'}</div>
        </div>,
        { autoClose: 5000 }
      );
      setStep('form');
    }
  }, [error, step]);

  if (!isOpen) return null;

  const handleDeposit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(`❌ ${validationError}`);
      return;
    }

    try {
      // Always need approval for ERC20 tokens (USDC)
      setStep('approve');
      await approveUSDC(amount);
      
      // The rest is handled by useEffect:
      // 1. When isApproveSuccess -> automatically calls deposit()
      // 2. When isSuccess -> shows success toast with stream ID
    } catch (err) {
      console.error('Deposit failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`❌ Stream failed: ${errorMsg}`);
      setStep('form');
    }
  };

  const handleClose = () => {
    if (!isApproving && !isDepositing) {
      setStep('form');
      setAmount('1000');
      setReceiverAgentId(0);
      setCreatedStreamId(null);
      onClose();
    }
  };

  const validateForm = (): string | null => {
    if (!isConnected || !address) return 'Please connect your wallet first';
    if (parseFloat(amount) <= 0) return 'Please enter a valid amount';
    if (captainAgentId === 0) return 'Captain agent must be minted on-chain first';
    if (connectedAgents.length === 0) return 'No agents connected to Captain! Connect at least one subagent first.';
    if (!receiverAgentId || receiverAgentId === 0) return 'Please select a receiver agent';
    if (receiverAgentId === captainAgentId) return 'Cannot stream from Captain to Captain!';
    return null;
  };

  // Calculate duration based on amount and rate
  const calculateDuration = () => {
    const amt = parseFloat(amount);
    const rate = parseFloat(ratePerSecond);
    if (amt && rate && rate > 0) {
      const seconds = amt / rate;
      const hours = seconds / 3600;
      if (hours < 1) {
        return `${Math.floor(seconds / 60)} minutes`;
      } else if (hours < 24) {
        return `${hours.toFixed(1)} hours`;
      } else {
        return `${(hours / 24).toFixed(1)} days`;
      }
    }
    return '0 seconds';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-neon-green rounded-lg w-full max-w-2xl shadow-2xl shadow-neon-green/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-neon-green/30">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-neon-green" />
            <h2 className="text-base font-bold text-white font-mono">AGENT STREAM (A2A)</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isDepositing || isApproving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {step === 'form' && (
            <>
              {/* Connected Agents Validation */}
              {connectedAgents.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-xs text-gray-300">
                  <p className="text-red-400 font-bold">⚠️ NO CONNECTED AGENTS!</p>
                  <p className="text-gray-400 text-xs mt-1">Connect agents on canvas first</p>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-green-400 font-bold">✅ {connectedAgents.length} Agent{connectedAgents.length > 1 ? 's' : ''} Connected</p>
                    <p className="text-yellow-400 text-xs">⚡ 2 txns: ~0.5-1 HBAR</p>
                  </div>
                </div>
              )}

              {/* Receiver Agent Selection */}
              {connectedAgents.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400">
                    RECEIVER ({connectedAgents.length} connected)
                  </label>
                  <select
                    value={receiverAgentId}
                    onChange={(e) => setReceiverAgentId(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded font-mono text-sm focus:outline-none focus:border-neon-green hover:border-gray-600 transition-colors"
                    disabled={step !== 'form'}
                  >
                    <option value={0}>→ Select agent to fund...</option>
                    {connectedAgents.map(({agentId, tokenId}) => {
                      const agentNames: Record<string, string> = {
                        'a0': '🦁 Aslan the Great (Commander)',
                        'a1': '🦅 Eagleton Skywatcher (Navigator)',
                        'a2': '🦉 Athena Nightwing (Archivist)',
                        'a3': '🦊 Reynard Swift (Merchant)',
                        'a4': '🐻 Ursus Guardian (Sentinel)',
                        'a5': '🐺 Luna Mysticfang (Oracle)',
                        'a6': '🐦 Corvus Messenger (Glitch)'
                      };
                      return (
                        <option key={agentId} value={Number(tokenId)}>
                          {agentNames[agentId] || agentId} - Token #{tokenId.toString()}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Asset Selection - Simplified to USDC only */}
              <div className="bg-neon-green/5 border border-neon-green/20 rounded p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-white font-bold">USDC</p>
                    <p className="text-xs text-gray-500">ERC20 only</p>
                  </div>
                  <div className="bg-neon-green/20 text-neon-green px-2 py-0.5 rounded font-mono text-xs">
                    Selected
                  </div>
                </div>
              </div>

              {/* Amount and Rate - 2 Column Layout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400">STREAM CAP</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.1"
                      min="0.1"
                      disabled={step !== 'form'}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono focus:border-neon-green focus:outline-none disabled:opacity-50 text-sm"
                      placeholder="0.1"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">
                      USDC
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400">RATE</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={ratePerSecond}
                      onChange={(e) => setRatePerSecond(e.target.value)}
                      step="0.00001"
                      min="0.00001"
                      disabled={step !== 'form'}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono focus:border-neon-green focus:outline-none disabled:opacity-50 text-sm"
                      placeholder="0.00001"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">
                      /sec
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Summary */}
              {receiverAgentId > 0 && parseFloat(amount) > 0 && (
                <div className="bg-neon-green/5 border border-neon-green/20 rounded p-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">From</p>
                      <p className="text-yellow-300 font-mono">🦁 #{captainAgentId}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">To</p>
                      <p className="text-neon-green font-mono">🎯 #{receiverAgentId}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Duration</p>
                      <p className="text-purple-400 font-mono">{calculateDuration()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleDeposit}
                disabled={isApproving || isDepositing || !receiverAgentId || parseFloat(amount) <= 0}
                className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-bold py-3 px-4 rounded font-mono disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-neon-green/50"
              >
                {isApproving || isDepositing ? '⏳ Processing...' : '🚀 Open Stream'}
              </button>
            </>
          )}

          {step === 'approve' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
                <TrendingUp size={32} className="text-yellow-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Approving USDC...</h3>
              <p className="text-sm text-gray-400">
                Confirm approval in your wallet
              </p>
              <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {step === 'deposit' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
                <Zap size={32} className="text-neon-green animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Opening Stream...</h3>
              <p className="text-sm text-gray-400">
                Confirm deposit in your wallet
              </p>
              <div className="animate-spin w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
                <DollarSign size={32} className="text-neon-green" />
              </div>
              <h3 className="text-lg font-bold text-neon-green font-mono">✅ STREAM OPENED!</h3>
              
              {/* Stream ID Display */}
              {createdStreamId && (
                <div className="bg-neon-green/10 border-2 border-neon-green rounded-lg p-4 mx-auto max-w-xs">
                  <p className="text-xs text-gray-400 font-mono mb-1">YOUR STREAM ID</p>
                  <p className="text-3xl font-bold text-neon-green font-mono">#{createdStreamId}</p>
                  <p className="text-xs text-gray-400 font-mono mt-2">
                    💡 Save this ID to withdraw funds later
                  </p>
                </div>
              )}
              
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stream Cap:</span>
                  <span className="text-white font-bold">{amount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="text-neon-green font-mono">{ratePerSecond} USDC/sec</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-purple-400">{calculateDuration()}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Only the <strong>receiver agent owner</strong> can withdraw funds
                  </p>
                </div>
              </div>
              {streamHash && (
                <a
                  href={`https://hashscan.io/testnet/transaction/${streamHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neon-green hover:underline font-mono"
                >
                  View on HashScan →
                </a>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-neon-green hover:bg-neon-green/80 text-black font-bold py-3 rounded font-mono transition-colors"
                >
                  🎉 Create Another Stream
                </button>
                <button
                  onClick={() => {
                    handleClose();
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-mono py-3 rounded transition-colors"
                >
                  Done
                </button>
              </div>
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
