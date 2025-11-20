import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import X402StreamingABI from '../contracts/abis/X402Streaming.json';
import { USDC_ADDRESS, X402_STREAMING_ADDRESS } from '../config/walletConfig';
import { useState, useEffect } from 'react';

// Export for use in other components
export { X402_STREAMING_ADDRESS, X402StreamingABI, USDC_ADDRESS };

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
      
      // Approval transaction will be tracked via isApproveSuccess
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
      // X402 contract only accepts ERC20 tokens (USDC uses 6 decimals)
      const decimals = asset === 'USDC' ? 6 : 6; // Only USDC supported
      const spendingCap = parseUnits(amount, decimals);
      const rate = parseUnits(ratePerSecond, decimals);

      // Get asset address (must be ERC20, not zero address)
      const assetAddress = asset === 'USDC' 
        ? USDC_ADDRESS 
        : USDC_ADDRESS; // Fallback to USDC, X402 doesn't support native HBAR

      console.log('Opening x402 stream:', {
        senderAgentId,
        receiverAgentId,
        ratePerSecond: rate.toString(),
        spendingCap: spendingCap.toString(),
        asset: assetAddress,
        note: 'ERC20 only - openStream is not payable'
      });

      // For USDC, check approval first
      if (asset === 'USDC') {
        // This would need to check allowance via useReadContract
        // For now, user must approve first
      }

      // Estimate reasonable gas for Hedera
      const gasLimit = BigInt(800000); // ~0.8M gas units, typical for Hedera contract calls
      
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
        // No value parameter - openStream is not payable, uses safeTransferFrom for ERC20
        gas: gasLimit
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
    isApproveSuccess, // Add approval success flag
    approvalNeeded,
    // Transaction hashes and receipt
    streamReceipt,
    approveHash,
    streamHash,
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
      // Set reasonable gas limit for Hedera
      const gasLimit = BigInt(300000); // ~0.3M gas units for simple withdrawal
      
      await writeContract({
        address: X402_STREAMING_ADDRESS,
        abi: X402StreamingABI.abi,
        functionName: 'withdraw',
        args: [BigInt(streamId)],
        gas: gasLimit
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

/**
 * Hook to get withdrawable balance for a specific stream
 */
export const useX402WithdrawableBalance = (streamId: number | null) => {
  const { data: owedAmount, isLoading, error } = useReadContract({
    address: X402_STREAMING_ADDRESS,
    abi: X402StreamingABI.abi,
    functionName: 'calculateOwed',
    args: streamId !== null && streamId > 0 ? [BigInt(streamId)] : undefined,
    query: {
      enabled: streamId !== null && streamId > 0,
      refetchInterval: 5000 // Refresh every 5 seconds to show accumulating balance
    }
  });

  const { data: streamData } = useReadContract({
    address: X402_STREAMING_ADDRESS,
    abi: X402StreamingABI.abi,
    functionName: 'getStreamData',
    args: streamId !== null && streamId > 0 ? [BigInt(streamId)] : undefined,
    query: {
      enabled: streamId !== null && streamId > 0,
      refetchInterval: 3000 // Refresh every 3 seconds to update stream status
    }
  });

  return {
    owedAmount,
    streamData,
    isLoading,
    error
  };
};

/**
 * Hook to get user's streams as receiver (can withdraw from these)
 * Fetches streams where the user owns the receiver agent
 */
export const useUserReceivableStreams = (receiverAgentIds: number[]) => {
  const [streams, setStreams] = useState<Array<{
    streamId: number;
    balance: bigint;
    senderAgentId: number;
    receiverAgentId: number;
    asset: string;
    active: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (receiverAgentIds.length === 0) {
      setStreams([]);
      return;
    }

    // For now, use localStorage as a starting point
    // In production, you'd query StreamOpened events from the blockchain
    const stored = localStorage.getItem('userStreams');
    if (stored) {
      try {
        const streamIds = JSON.parse(stored);
        setStreams(streamIds.map((id: number) => ({
          streamId: id,
          balance: 0n,
          senderAgentId: 0,
          receiverAgentId: 0,
          asset: '0x0000000000000000000000000000000000000000',
          active: true
        })));
      } catch (err) {
        console.error('Error loading streams:', err);
      }
    }
  }, [receiverAgentIds]);

  return { streams, isLoading };
};
