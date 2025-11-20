import React, { useState } from 'react';
import { X, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useX402Deposit } from '../hooks/useX402Deposit';
import { formatUnits } from 'viem';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  captainAgentId: number;
  onDepositSuccess?: (streamId: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  captainAgentId,
  onDepositSuccess
}) => {
  const { address, isConnected } = useAccount();
  const { deposit, approveUSDC, isApproving, isDepositing, isSuccess, streamHash, error } = useX402Deposit();

  const [amount, setAmount] = useState('10');
  const [asset, setAsset] = useState<'HBAR' | 'USDC'>('USDC');
  const [receiverAgentId, setReceiverAgentId] = useState('');
  const [ratePerSecond, setRatePerSecond] = useState('0.0001');
  const [step, setStep] = useState<'form' | 'approve' | 'deposit' | 'success'>('form');

  if (!isOpen) return null;

  const handleDeposit = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!receiverAgentId || parseFloat(amount) <= 0) {
      alert('Please fill in all fields');
      return;
    }

    if (captainAgentId === 0) {
      alert('Captain agent must be minted on-chain first. Please activate the Captain agent.');
      return;
    }

    try {
      // For USDC, need approval first
      if (asset === 'USDC') {
        setStep('approve');
        await approveUSDC(amount);
        setStep('deposit');
      } else {
        setStep('deposit');
      }

      await deposit({
        amount,
        asset,
        senderAgentId: captainAgentId,
        receiverAgentId: parseInt(receiverAgentId),
        ratePerSecond
      });

      setStep('success');
      
      // Extract stream ID from event logs (would need to parse receipt)
      if (onDepositSuccess) {
        // In a real implementation, parse the StreamOpened event from receipt
        onDepositSuccess(0); // Placeholder
      }
    } catch (err) {
      console.error('Deposit failed:', err);
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setAmount('10');
    setReceiverAgentId('');
    onClose();
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
      <div className="bg-gray-900 border-2 border-neon-green rounded-lg w-full max-w-md shadow-2xl shadow-neon-green/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neon-green/30">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-neon-green" />
            <h2 className="text-lg font-bold text-white font-mono">FUND BALANCE</h2>
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
        <div className="p-6 space-y-4">
          {step === 'form' && (
            <>
              <div className="bg-neon-green/5 border border-neon-green/20 rounded p-3 text-xs text-gray-300">
                {captainAgentId === 0 ? (
                  <p>⚠️ Captain agent not minted yet. Please activate the Captain agent first to enable deposits.</p>
                ) : (
                  <p>💡 Deposit funds to the Captain (Commander Agent #{captainAgentId}) for autonomous task execution via x402 streaming payments.</p>
                )}
              </div>

              {/* Asset Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">ASSET</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAsset('HBAR')}
                    className={`px-4 py-2 rounded border font-mono text-sm transition-all ${
                      asset === 'HBAR'
                        ? 'bg-neon-green/20 border-neon-green text-neon-green'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    HBAR
                  </button>
                  <button
                    onClick={() => setAsset('USDC')}
                    className={`px-4 py-2 rounded border font-mono text-sm transition-all ${
                      asset === 'USDC'
                        ? 'bg-neon-green/20 border-neon-green text-neon-green'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    USDC
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">DEPOSIT AMOUNT</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white font-mono focus:border-neon-green focus:outline-none"
                    placeholder="10.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">
                    {asset}
                  </span>
                </div>
              </div>

              {/* Receiver Agent ID */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">RECEIVER AGENT ID</label>
                <input
                  type="number"
                  value={receiverAgentId}
                  onChange={(e) => setReceiverAgentId(e.target.value)}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white font-mono focus:border-neon-green focus:outline-none"
                  placeholder="e.g., 1"
                />
                <p className="text-xs text-gray-500">The agent that will receive streaming payments</p>
              </div>

              {/* Payment Rate */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">PAYMENT RATE (per second)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={ratePerSecond}
                    onChange={(e) => setRatePerSecond(e.target.value)}
                    step="0.00001"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white font-mono focus:border-neon-green focus:outline-none"
                    placeholder="0.0001"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">
                    {asset}/s
                  </span>
                </div>
              </div>

              {/* Info Summary */}
              <div className="bg-gray-800/50 border border-gray-700 rounded p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-mono">Stream Duration:</span>
                  <span className="text-neon-green font-mono font-bold">{calculateDuration()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-mono">Captain → Agent:</span>
                  <span className="text-white font-mono">#{captainAgentId} → #{receiverAgentId || '?'}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleDeposit}
                disabled={!isConnected || !amount || !receiverAgentId || parseFloat(amount) <= 0}
                className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-bold font-mono py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                OPEN x402 STREAM
              </button>

              {!isConnected && (
                <p className="text-center text-xs text-red-400 font-mono">⚠️ Connect wallet to continue</p>
              )}
            </>
          )}

          {step === 'approve' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
                <TrendingUp size={32} className="text-yellow-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Approving USDC...</h3>
              <p className="text-sm text-gray-400">
                Approve X402 contract to spend {amount} USDC
              </p>
              <div className="animate-spin w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {step === 'deposit' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
                <Zap size={32} className="text-neon-green animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Opening Stream...</h3>
              <p className="text-sm text-gray-400">
                Depositing {amount} {asset} to Captain
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
              <p className="text-sm text-gray-400">
                Captain funded with {amount} {asset}
              </p>
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
