import React, { useState } from 'react';
import { Zap, Hand, DollarSign, TrendingUp, TrendingDown, Wallet, ChevronDown, ChevronUp } from 'lucide-react';

interface CaptainControlPanelProps {
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  isConnected: boolean;
  isCaptainRegistered: boolean;
  captainTokenId: number;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const CaptainControlPanel: React.FC<CaptainControlPanelProps> = ({
  mode,
  onModeChange,
  isConnected,
  isCaptainRegistered,
  captainTokenId,
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`
      bg-black/90 backdrop-blur-md border rounded-lg shadow-lg overflow-hidden transition-all duration-200
      ${isExpanded 
        ? 'border-neon-green/50 shadow-neon-green/20' 
        : 'border-neon-green/30 shadow-neon-green/10'
      }
    `}>
      {/* Main Control Bar - Always Visible */}
      <div className="flex items-center gap-2 p-2">
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-black/50 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => onModeChange('manual')}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold font-mono transition-all
              ${mode === 'manual' 
                ? 'bg-neon-green text-black shadow-sm' 
                : 'text-white/50 hover:text-white/80'
              }
            `}
            title="Manual Control"
          >
            <Hand size={12} />
            MANUAL
          </button>
          <button
            onClick={() => onModeChange('auto')}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold font-mono transition-all
              ${mode === 'auto' 
                ? 'bg-neon-green text-black shadow-sm' 
                : 'text-white/50 hover:text-white/80'
              }
            `}
            title="Auto Mode"
          >
            <Zap size={12} />
            AUTO
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/10"></div>

        {/* Captain Info */}
        {isCaptainRegistered ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-neon-green/10 border border-neon-green/30 rounded text-xs">
            <Wallet size={12} className="text-neon-green" />
            <span className="text-neon-green font-mono font-bold">CAPTAIN #{captainTokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs">
            <Wallet size={12} className="text-red-400" />
            <span className="text-red-400 font-mono text-[10px]">NOT REGISTERED</span>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!isConnected}
          className={`
            ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all
            ${isExpanded 
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
              : 'text-white/50 hover:text-white/80 border border-white/10'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={isConnected ? (isExpanded ? 'Hide x402 Controls' : 'Show x402 Controls') : 'Connect wallet first'}
        >
          <DollarSign size={12} />
          x402
          {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>

      {/* Expanded Section - x402 Streaming Controls */}
      {isExpanded && isConnected && (
        <div className="border-t border-white/10 bg-black/40 p-3 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-neon-green" />
            <span className="text-neon-green/70 font-mono text-[10px] uppercase tracking-wider">
              x402 STREAMING PAYMENTS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Deposit Button */}
            <button
              onClick={onOpenDeposit}
              disabled={!isCaptainRegistered}
              className="
                flex items-center justify-center gap-1.5 px-3 py-2 rounded
                bg-neon-green/10 hover:bg-neon-green/20 
                border border-neon-green/30 hover:border-neon-green/50
                text-neon-green font-mono text-xs font-bold
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              title={isCaptainRegistered ? 'Open deposit stream to Captain' : 'Register Captain first'}
            >
              <TrendingUp size={14} />
              DEPOSIT
            </button>

            {/* Withdraw Button */}
            <button
              onClick={onOpenWithdraw}
              disabled={!isCaptainRegistered}
              className="
                flex items-center justify-center gap-1.5 px-3 py-2 rounded
                bg-purple-500/10 hover:bg-purple-500/20 
                border border-purple-500/30 hover:border-purple-500/50
                text-purple-400 font-mono text-xs font-bold
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              title={isCaptainRegistered ? 'Withdraw from active stream' : 'Register Captain first'}
            >
              <TrendingDown size={14} />
              WITHDRAW
            </button>
          </div>

          {!isCaptainRegistered && (
            <div className="mt-2 text-[9px] text-red-400/80 font-mono text-center border border-red-500/20 bg-red-500/5 rounded px-2 py-1">
              ⚠️ Register Captain Aslan to enable x402 streaming
            </div>
          )}

          {isCaptainRegistered && (
            <div className="mt-2 space-y-1">
              <div className="text-[9px] text-neon-green/60 font-mono text-center">
                💡 All deposits flow to Captain #{captainTokenId}
              </div>
              <div className="flex items-center justify-center gap-1 text-[8px] text-white/40 font-mono">
                <div className="w-1 h-1 rounded-full bg-neon-green animate-pulse"></div>
                x402 Contract Connected
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
