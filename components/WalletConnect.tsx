import React, { useEffect, useState } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { USDC_ADDRESS } from '../config/walletConfig';
import { Wallet, Droplet } from 'lucide-react';

// ERC20 ABI for balanceOf and decimals
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  // HBAR balance
  const { data: hbarBalance } = useBalance({
    address: address,
  });

  // USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: usdcDecimals } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Check if USDC balance is zero
  const usdcBalanceValue = usdcBalance && usdcDecimals ? parseFloat(formatUnits(usdcBalance, usdcDecimals)) : 0;
  const hasZeroUSDC = usdcBalanceValue === 0;

  return (
    <div className="flex items-center gap-3">
      {isConnected && address ? (
        <>
          {/* HBAR Balance */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded border border-white/10">
            <span className="text-gray-400 text-xs">HBAR:</span>
            <span className="text-white font-bold text-xs">
              {hbarBalance ? parseFloat(formatUnits(hbarBalance.value, 18)).toFixed(4) : '0.0000'}
            </span>
          </div>

          {/* USDC Balance */}
          <div className="flex items-center gap-2 bg-[#39ff14]/10 px-3 py-1 rounded border border-[#39ff14]/30">
            <span className="text-[#39ff14]/70 text-xs">USDC:</span>
            <span className="text-[#39ff14] font-bold text-xs">
              {usdcBalance && usdcDecimals ? parseFloat(formatUnits(usdcBalance, usdcDecimals)).toFixed(2) : '0.00'}
            </span>
          </div>

          {/* USDC Faucet Button - Only show when balance is 0 */}
          {hasZeroUSDC && (
            <a
              href="https://faucet.hedera.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded border border-blue-500/30 transition-colors group"
              title="Get free testnet USDC"
            >
              <Droplet size={14} className="text-blue-400 group-hover:animate-bounce" />
              <span className="text-blue-400 font-bold text-xs">Get USDC</span>
            </a>
          )}


          {/* Connected Address - Click to manage */}
          <button
            onClick={() => (window as any).modal?.open()}
            className="flex items-center gap-2 bg-[#39ff14]/10 hover:bg-[#39ff14]/20 px-3 py-1 rounded border border-[#39ff14]/30 transition-colors"
          >
            <Wallet size={14} className="text-[#39ff14]" />
            <span className="text-[#39ff14] font-bold text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </button>
        </>
      ) : (
        <button
          onClick={() => (window as any).modal?.open()}
          className="flex items-center gap-2 px-3 py-1 bg-[#39ff14] hover:bg-[#39ff14]/80 text-black font-bold text-xs rounded transition-colors"
        >
          <Wallet size={14} />
          Connect Wallet
        </button>
      )}
    </div>
  );
};
