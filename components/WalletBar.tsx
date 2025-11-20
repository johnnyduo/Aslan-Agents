import React, { useState, useEffect } from 'react';
import { Layers, BarChart3, TrendingUp } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useX402WithdrawableBalance } from '../hooks/useX402Deposit';

interface WalletBarProps {
  onViewResults?: () => void;
}

// Component to track a single stream's rate
const StreamRateTracker: React.FC<{
  streamId: number;
  onRateUpdate: (id: number, rate: bigint, closed: boolean) => void;
}> = ({ streamId, onRateUpdate }) => {
  const { streamData } = useX402WithdrawableBalance(streamId);

  useEffect(() => {
    if (streamData && Array.isArray(streamData)) {
      const ratePerSecond = streamData[3] ? BigInt(streamData[3]) : 0n;
      const isClosed = streamData[8] ? Boolean(streamData[8]) : true;
      onRateUpdate(streamId, ratePerSecond, isClosed);
    }
  }, [streamData, streamId, onRateUpdate]);

  return null;
};

const WalletBar: React.FC<WalletBarProps> = ({ 
  onViewResults
}) => {
  const { isConnected } = useAccount();
  const [totalStreamRate, setTotalStreamRate] = useState('0.000000');
  const [streamIds, setStreamIds] = useState<number[]>([]);
  const [streamRates, setStreamRates] = useState<Map<number, { rate: bigint, closed: boolean }>>(new Map());

  // Load stream IDs from localStorage
  useEffect(() => {
    const loadStreams = () => {
      const stored = localStorage.getItem('userStreams');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Filter to only valid, reasonable stream IDs (< 1 million)
          const ids = Array.isArray(parsed) 
            ? parsed
                .map((id: string) => Number(id))
                .filter((id: number) => !isNaN(id) && id > 0 && id < 1000000 && Number.isFinite(id))
            : [];
          
          // Clean up localStorage if we found invalid IDs
          if (ids.length !== parsed.length) {
            console.log('Cleaning invalid stream IDs from localStorage');
            localStorage.setItem('userStreams', JSON.stringify(ids.map(String)));
          }
          
          setStreamIds(ids);
          console.log('Loaded stream IDs for aggregation:', ids);
        } catch (err) {
          console.error('Error loading streams:', err);
        }
      }
    };

    loadStreams();
    const interval = setInterval(loadStreams, 2000);
    return () => clearInterval(interval);
  }, []);

  // Callback to update individual stream rates
  const handleRateUpdate = (id: number, rate: bigint, closed: boolean) => {
    setStreamRates(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { rate, closed });
      return newMap;
    });
  };

  // Calculate total from fetched rates
  useEffect(() => {
    let totalRate = 0n;
    
    streamRates.forEach(({ rate, closed }) => {
      if (!closed && rate > 0n) {
        totalRate += rate;
      }
    });

    const formatted = formatUnits(totalRate, 6);
    const displayRate = parseFloat(formatted).toFixed(6);
    console.log('Total stream rate:', displayRate, 'USDC/s from', streamRates.size, 'streams');
    setTotalStreamRate(displayRate);
  }, [streamRates]);
  return (
    <div className="h-12 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-6 justify-between z-50 sticky top-0">
        <div className="flex items-center gap-4">
            <h1 className="text-neon-green font-bold font-mono tracking-wider flex items-center gap-2">
                <Layers size={18} /> SPRITEOPS <span className="text-white/40 text-xs font-normal">v1.0.4-beta</span>
            </h1>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
            {/* Invisible stream rate trackers */}
            {streamIds.map(id => (
              <StreamRateTracker key={id} streamId={id} onRateUpdate={handleRateUpdate} />
            ))}
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded border transition-all ${
              parseFloat(totalStreamRate) > 0
                ? 'bg-neon-green/10 border-neon-green/30'
                : 'bg-gray-500/10 border-gray-500/30'
            }`}>
                <TrendingUp size={12} className={parseFloat(totalStreamRate) > 0 ? 'text-neon-green' : 'text-gray-500'} />
                <span className={parseFloat(totalStreamRate) > 0 ? 'text-neon-green/70' : 'text-gray-500/70'}>x402 STREAM:</span>
                <span className={`font-bold ${
                  parseFloat(totalStreamRate) > 0 ? 'text-neon-green' : 'text-gray-500'
                }`}>{totalStreamRate} USDC/s</span>
            </div>

            {onViewResults && (
                <button
                    onClick={onViewResults}
                    className="flex items-center gap-2 bg-[#39ff14]/10 hover:bg-[#39ff14]/20 px-3 py-1 rounded border border-[#39ff14]/30 transition-colors"
                >
                    <BarChart3 size={14} className="text-[#39ff14]" />
                    <span className="text-[#39ff14] font-semibold">Results</span>
                </button>
            )}

            <WalletConnect />
        </div>
    </div>
  );
};

export default WalletBar;