import React, { useState, useEffect } from 'react';
import { X, TrendingDown, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useX402Withdraw } from '../hooks/useX402Deposit';
import { toast } from 'react-toastify';
import { StreamWithdrawCard } from './StreamWithdrawCard';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  captainAgentId: number;
  connectedAgents: Array<{agentId: string, tokenId: bigint}>;
  onWithdrawSuccess?: () => void;
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

  const [userStreams, setUserStreams] = useState<string[]>([]);
  const [withdrawingStreamId, setWithdrawingStreamId] = useState<string | null>(null);
  const [step, setStep] = useState<'list' | 'success'>('list');
  const [successHandled, setSuccessHandled] = useState(false);

  // Load user's created streams
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('userStreams');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Filter valid stream IDs and clean up scientific notation
          const validStreams = Array.isArray(parsed) 
            ? parsed.filter((id: string) => {
                const num = Number(id);
                return !isNaN(num) && num > 0 && num < 1000000 && Number.isFinite(num);
              })
            : [];
          
          // Clean localStorage if needed
          if (validStreams.length !== parsed.length) {
            console.log('Cleaned invalid stream IDs from localStorage');
            localStorage.setItem('userStreams', JSON.stringify(validStreams));
          }
          
          setUserStreams(validStreams.reverse()); // Newest first
        } catch (err) {
          console.error('Error loading streams:', err);
        }
      }
    }
  }, [isOpen]);

  // Handle successful withdrawal
  useEffect(() => {
    if (isSuccess && hash && withdrawingStreamId && !successHandled) {
      setSuccessHandled(true);
      setStep('success');
      
      toast.success(
        <div>
          <div className="font-bold">✅ Withdrawal Successful!</div>
          <a 
            href={`https://hashscan.io/testnet/transaction/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-green hover:underline text-sm"
          >
            View on HashScan →
          </a>
        </div>,
        { autoClose: 8000 }
      );

      if (onWithdrawSuccess) {
        onWithdrawSuccess();
      }
    }
  }, [isSuccess, hash, withdrawingStreamId, successHandled]);

  // Handle errors
  useEffect(() => {
    if (error && withdrawingStreamId) {
      toast.error(
        <div>
          <div className="font-bold">❌ Withdrawal Failed</div>
          <div className="text-sm">{error.message || 'Please try again'}</div>
        </div>,
        { autoClose: 5000 }
      );
      setWithdrawingStreamId(null);
      setStep('list');
    }
  }, [error, withdrawingStreamId]);

  if (!isOpen) return null;

  const handleWithdraw = async (streamId: string) => {
    if (!isConnected) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    setWithdrawingStreamId(streamId);
    setSuccessHandled(false); // Reset success flag for new withdrawal
    
    try {
      await withdraw(Number(streamId));
    } catch (err) {
      console.error('Withdrawal failed:', err);
      setWithdrawingStreamId(null);
      setSuccessHandled(false);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setStep('list');
      setWithdrawingStreamId(null);
      setSuccessHandled(false);
      onClose();
    }
  };

  const handleRefresh = () => {
    const stored = localStorage.getItem('userStreams');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserStreams(Array.isArray(parsed) ? parsed.reverse() : []);
        toast.info('🔄 Refreshed stream list');
      } catch (err) {
        console.error('Error loading streams:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-neon-green rounded-lg w-full max-w-2xl max-h-[90vh] shadow-2xl shadow-neon-green/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neon-green/30">
          <div className="flex items-center gap-2">
            <TrendingDown size={20} className="text-neon-green" />
            <h2 className="text-lg font-bold text-white font-mono">WITHDRAW FUNDS</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="text-gray-400 hover:text-neon-green transition-colors"
              disabled={isPending}
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isPending}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {step === 'list' && (
            <>
              {captainAgentId === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-center">
                  <p className="text-red-400 font-bold font-mono">⚠️ CAPTAIN NOT REGISTERED!</p>
                  <p className="text-sm text-red-400/80 mt-2">Please activate the Captain agent first.</p>
                </div>
              ) : userStreams.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-6 text-center">
                  <p className="text-yellow-400 font-bold font-mono mb-2">📭 NO STREAMS FOUND</p>
                  <p className="text-sm text-gray-400">
                    Create a payment stream first using the Deposit modal.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Stream IDs are automatically saved when you create deposits.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-neon-green/5 border border-neon-green/20 rounded p-3 text-xs text-gray-300">
                    <p className="text-neon-green font-bold mb-1">💡 Your Payment Streams</p>
                    <p>Select a stream below to withdraw accumulated funds. Balances update every 5 seconds.</p>
                  </div>

                  <div className="space-y-3">
                    {userStreams.map((streamId) => (
                      <StreamWithdrawCard
                        key={streamId}
                        streamId={streamId}
                        onWithdraw={handleWithdraw}
                        isWithdrawing={withdrawingStreamId === streamId && isPending}
                      />
                    ))}
                  </div>
                </>
              )}

              {!isConnected && (
                <div className="text-center mt-4">
                  <p className="text-xs text-red-400 font-mono">⚠️ Connect wallet to withdraw</p>
                </div>
              )}
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
                <TrendingDown size={32} className="text-neon-green" />
              </div>
              <h3 className="text-lg font-bold text-neon-green font-mono">✅ WITHDRAWAL COMPLETE!</h3>
              <p className="text-sm text-gray-400">
                Funds successfully withdrawn from stream #{withdrawingStreamId}
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
        </div>
      </div>
    </div>
  );
};
