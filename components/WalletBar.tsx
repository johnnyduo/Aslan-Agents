import React from 'react';
import { Wifi, Battery, Layers } from 'lucide-react';

const WalletBar = () => {
  return (
    <div className="h-10 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-6 justify-between z-50 sticky top-0">
        <div className="flex items-center gap-4">
            <h1 className="text-neon-green font-bold font-mono tracking-wider flex items-center gap-2">
                <Layers size={18} /> SPRITEOPS <span className="text-white/40 text-xs font-normal">v1.0.4-beta</span>
            </h1>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2 text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Mainnet Alpha</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded border border-white/10">
                <span className="text-gray-400">ETH:</span>
                <span className="text-white font-bold">12.4042</span>
            </div>

            <div className="flex items-center gap-2 bg-neon-green/10 px-3 py-1 rounded border border-neon-green/30">
                <span className="text-neon-green/70">x402 STREAM:</span>
                <span className="text-neon-green font-bold animate-pulse">0.00042 ETH/s</span>
            </div>

            <div className="flex items-center gap-3 text-gray-500 border-l border-white/10 pl-4">
                <Wifi size={14} />
                <Battery size={14} />
                <span className="text-neon-green">0x9A...4b2C</span>
            </div>
        </div>
    </div>
  );
};

export default WalletBar;