import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import X402StreamingABI from '../contracts/abis/X402Streaming.json';
import { USDC_ADDRESS, X402_STREAMING_ADDRESS } from '../config/walletConfig';
import { useState, useEffect } from 'react';

// ERC20 ABI for approve and allowance
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
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

export interface DepositParams {
  amount: string; // Amount in human-readable format (e.g., "10.5")
  asset: 'HBAR' | 'USDC';
  senderAgentId: number; // Captain/Commander agent ID
  receiverAgentId: number; // Agent receiving the deposit
  ratePerSecond: string; // Payment rate (e.g., "0.0001")
}

/**
 * Hook to deposit funds and open x402 streaming payment to an agent
 * This allows the Captain (Commander) to fund agents for autonomous operations
 */
export const useX402Deposit = () => {
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Contract write hooks
  const { 
    writeContract: writeApprove, 
    data: approveHash, 
    isPending: isApprovePending,
    error: approveError 
  } = useWriteContract();

  const { 
    writeContract: writeOpenStream, 
    data: streamHash, 
    isPending: isStreamPending,
    error: streamError 
  } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = 
    useWaitForTransactionReceipt({ hash: approveHash });

  const { isLoading: isStreamConfirming, isSuccess: isStreamSuccess, data: streamReceipt } = 
    useWaitForTransactionReceipt({ hash: streamHash });

  /**
   * Check USDC allowance for X402 contract
   */
  const checkAllowance = async (userAddress: `0x${string}`, amount: bigint) => {
    // For HBAR (native token), no approval needed
    return { needsApproval: false };
  };

  /**
   * Approve USDC spending for X402 contract
   */
  const approveUSDC = async (amount: string) => {
    try {
      setIsApproving(true);
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      await writeApprove({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [X402_STREAMING_ADDRESS, amountWei]
      });
    } catch (error) {
      console.error('Approve error:', error);
      setIsApproving(false);
      throw error;
    }
  };

  /**
   * Open streaming payment (deposit funds to agent via x402)
   */
  const deposit = async (params: DepositParams) => {
    try {
      const { amount, asset, senderAgentId, receiverAgentId, ratePerSecond } = params;

      // Parse amounts based on asset type
      const decimals = asset === 'USDC' ? 6 : 18;
      const spendingCap = parseUnits(amount, decimals);
      const rate = parseUnits(ratePerSecond, decimals);

      // Get asset address
      const assetAddress = asset === 'USDC' 
        ? USDC_ADDRESS 
        : '0x0000000000000000000000000000000000000000'; // Use zero address for native HBAR

      console.log('Opening x402 stream:', {
        senderAgentId,
        receiverAgentId,
        ratePerSecond: rate.toString(),
        spendingCap: spendingCap.toString(),
        asset: assetAddress
      });

      // For USDC, check approval first
      if (asset === 'USDC') {
        // This would need to check allowance via useReadContract
        // For now, user must approve first
      }

      await writeOpenStream({
        address: X402_STREAMING_ADDRESS,
        abi: X402StreamingABI.abi,
        functionName: 'openStream',
        args: [
          BigInt(senderAgentId),
          BigInt(receiverAgentId),
          rate,
          spendingCap,
          assetAddress
        ],
        value: asset === 'HBAR' ? spendingCap : BigInt(0) // Send HBAR if native token
      });

      return { success: true };
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  };

  // Update approval status when approval transaction succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      setIsApproving(false);
      setApprovalNeeded(false);
    }
  }, [isApproveSuccess]);

  return {
    deposit,
    approveUSDC,
    checkAllowance,
    // Status flags
    isApproving: isApprovePending || isApproveConfirming,
    isDepositing: isStreamPending || isStreamConfirming,
    isSuccess: isStreamSuccess,
    approvalNeeded,
    // Transaction hashes
    approveHash,
    streamHash,
    streamReceipt,
    // Errors
    error: approveError || streamError
  };
};

/**
 * Hook to read stream data and balances
 */
export const useX402StreamData = (streamId: number | null) => {
  const { data: streamData, isLoading, error } = useReadContract({
    address: X402_STREAMING_ADDRESS,
    abi: X402StreamingABI.abi,
    functionName: 'getStreamData',
    args: streamId !== null ? [BigInt(streamId)] : undefined,
    query: {
      enabled: streamId !== null && streamId > 0
    }
  });

  const { data: remainingAllowance } = useReadContract({
    address: X402_STREAMING_ADDRESS,
    abi: X402StreamingABI.abi,
    functionName: 'remainingAllowance',
    args: streamId !== null ? [BigInt(streamId)] : undefined,
    query: {
      enabled: streamId !== null && streamId > 0
    }
  });

  const { data: owedAmount } = useReadContract({
    address: X402_STREAMING_ADDRESS,
    abi: X402StreamingABI.abi,
    functionName: 'calculateOwed',
    args: streamId !== null ? [BigInt(streamId)] : undefined,
    query: {
      enabled: streamId !== null && streamId > 0
    }
  });

  return {
    streamData,
    remainingAllowance,
    owedAmount,
    isLoading,
    error
  };
};

/**
 * Hook to push payments (keeper function - anyone can call)
 */
export const useX402PushPayments = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pushPayments = async (streamId: number) => {
    try {
      await writeContract({
        address: X402_STREAMING_ADDRESS,
        abi: X402StreamingABI.abi,
        functionName: 'pushPayments',
        args: [BigInt(streamId)]
      });
    } catch (error) {
      console.error('Push payments error:', error);
      throw error;
    }
  };

  return {
    pushPayments,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

/**
 * Hook to close stream and return remaining funds
 */
export const useX402CloseStream = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const closeStream = async (streamId: number) => {
    try {
      await writeContract({
        address: X402_STREAMING_ADDRESS,
        abi: X402StreamingABI.abi,
        functionName: 'closeStream',
        args: [BigInt(streamId)]
      });
    } catch (error) {
      console.error('Close stream error:', error);
      throw error;
    }
  };

  return {
    closeStream,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};

/**
 * Hook to withdraw accumulated payments (receiver only)
 */
export const useX402Withdraw = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (streamId: number) => {
    try {
      await writeContract({
        address: X402_STREAMING_ADDRESS,
        abi: X402StreamingABI.abi,
        functionName: 'withdraw',
        args: [BigInt(streamId)]
      });
    } catch (error) {
      console.error('Withdraw error:', error);
      throw error;
    }
  };

  return {
    withdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error
  };
};
