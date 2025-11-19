// Enhanced Hedera Mirror Node Service
// Based on OpenAPI spec: https://testnet.mirrornode.hedera.com/api/v1/docs/openapi.yml
// Version: 0.142.2
// Network: Hedera Testnet (Chain ID: 296)

const HEDERA_MIRROR_NODE_URL = (import.meta as any).env?.HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com/api/v1';

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface HederaAccount {
  account: string;
  alias: string | null;
  balance: {
    balance: number;
    timestamp: string;
    tokens: Array<{
      token_id: string;
      balance: number;
    }>;
  };
  auto_renew_period: number | null;
  created_timestamp: string | null;
  decline_reward: boolean;
  deleted: boolean;
  ethereum_nonce: number | null;
  evm_address: string | null;
  expiry_timestamp: string | null;
  key: any | null;
  max_automatic_token_associations: number | null;
  memo: string | null;
  pending_reward: number;
  receiver_sig_required: boolean | null;
  staked_account_id: string | null;
  staked_node_id: number | null;
  stake_period_start: string | null;
}

export interface HederaTransaction {
  transaction_id: string;
  consensus_timestamp: string;
  type: string;
  result: string;
  name: string;
  charged_tx_fee: number;
  max_fee: string;
  valid_start_timestamp: string;
  node: string | null;
  nonce: number;
  scheduled: boolean;
  transfers: Array<{
    account: string;
    amount: number;
    is_approval: boolean;
  }>;
  token_transfers?: Array<{
    token_id: string;
    account: string;
    amount: number;
    is_approval: boolean;
  }>;
  nft_transfers?: Array<{
    token_id: string;
    sender_account_id: string;
    receiver_account_id: string;
    serial_number: number;
    is_approval: boolean;
  }>;
}

export interface HederaBlock {
  count: number;
  gas_used: number | null;
  hapi_version: string;
  hash: string;
  logs_bloom: string | null;
  name: string;
  number: number;
  previous_hash: string;
  size: number | null;
  timestamp: {
    from: string;
    to: string;
  };
}

export interface HederaToken {
  token_id: string;
  name: string;
  symbol: string;
  decimals: number;
  type: 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE';
  total_supply: string;
  max_supply: string;
  treasury_account_id: string;
  created_timestamp: string;
  modified_timestamp: string;
  deleted: boolean;
  memo: string;
  freeze_default: boolean;
  pause_status: 'NOT_APPLICABLE' | 'PAUSED' | 'UNPAUSED';
  supply_type: 'FINITE' | 'INFINITE';
}

export interface HederaNetworkStake {
  max_stake_rewarded: number;
  max_staking_reward_rate_per_hbar: number;
  max_total_reward: number;
  node_reward_fee_fraction: number;
  reserved_staking_rewards: number;
  reward_balance_threshold: number;
  stake_total: number;
  staking_period: {
    from: string;
    to: string;
  };
  staking_period_duration: number;
  staking_periods_stored: number;
  staking_reward_fee_fraction: number;
  staking_reward_rate: number;
  staking_start_threshold: number;
  unreserved_staking_reward_balance: number;
}

export interface HederaNFT {
  account_id: string;
  created_timestamp: string;
  delegating_spender: string | null;
  deleted: boolean;
  metadata: string; // Base64 encoded
  modified_timestamp: string;
  serial_number: number;
  spender: string | null;
  token_id: string;
}

// ===========================
// ENHANCED HEDERA SERVICE
// ===========================

export const enhancedHederaService = {
  /**
   * ACCOUNTS API
   */
  
  // Get detailed account information
  async getAccountInfo(accountId: string): Promise<HederaAccount | null> {
    try {
      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/accounts/${accountId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getAccountInfo error:', error);
      return null;
    }
  },

  // Get NFTs owned by an account
  async getAccountNFTs(accountId: string, params: {
    limit?: number;
    order?: 'asc' | 'desc';
    tokenId?: string;
    serialNumber?: string;
  } = {}): Promise<HederaNFT[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.tokenId) query.append('token.id', params.tokenId);
      if (params.serialNumber) query.append('serialnumber', params.serialNumber);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/accounts/${accountId}/nfts?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.nfts || [];
    } catch (error) {
      console.error('getAccountNFTs error:', error);
      return [];
    }
  },

  // Get staking rewards history
  async getStakingRewards(accountId: string, params: {
    limit?: number;
    order?: 'asc' | 'desc';
    timestamp?: string;
  } = {}): Promise<any[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.timestamp) query.append('timestamp', params.timestamp);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/accounts/${accountId}/rewards?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.rewards || [];
    } catch (error) {
      console.error('getStakingRewards error:', error);
      return [];
    }
  },

  // Get token relationships for an account
  async getAccountTokens(accountId: string, params: {
    limit?: number;
    order?: 'asc' | 'desc';
    tokenId?: string;
  } = {}): Promise<any[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 50).toString(),
        order: params.order || 'asc'
      });
      if (params.tokenId) query.append('token.id', params.tokenId);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/accounts/${accountId}/tokens?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('getAccountTokens error:', error);
      return [];
    }
  },

  /**
   * TRANSACTIONS API
   */
  
  // Get transactions with advanced filtering
  async getTransactions(params: {
    accountId?: string;
    limit?: number;
    order?: 'asc' | 'desc';
    transactionType?: string;
    result?: 'success' | 'fail';
    timestamp?: string;
  } = {}): Promise<HederaTransaction[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.accountId) query.append('account.id', params.accountId);
      if (params.transactionType) query.append('transactiontype', params.transactionType);
      if (params.result) query.append('result', params.result);
      if (params.timestamp) query.append('timestamp', params.timestamp);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/transactions?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('getTransactions error:', error);
      return [];
    }
  },

  // Get specific transaction by ID
  async getTransactionById(transactionId: string, params: {
    nonce?: number;
    scheduled?: boolean;
  } = {}): Promise<any> {
    try {
      const query = new URLSearchParams();
      if (params.nonce !== undefined) query.append('nonce', params.nonce.toString());
      if (params.scheduled !== undefined) query.append('scheduled', params.scheduled.toString());

      const queryStr = query.toString();
      const url = `${HEDERA_MIRROR_NODE_URL}/transactions/${transactionId}${queryStr ? '?' + queryStr : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('getTransactionById error:', error);
      return null;
    }
  },

  /**
   * BLOCKS API
   */
  
  // Get recent blocks
  async getBlocks(params: {
    limit?: number;
    order?: 'asc' | 'desc';
    blockNumber?: string;
    timestamp?: string;
  } = {}): Promise<HederaBlock[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.blockNumber) query.append('block.number', params.blockNumber);
      if (params.timestamp) query.append('timestamp', params.timestamp);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/blocks?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.blocks || [];
    } catch (error) {
      console.error('getBlocks error:', error);
      return [];
    }
  },

  // Get specific block by hash or number
  async getBlock(hashOrNumber: string): Promise<HederaBlock | null> {
    try {
      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/blocks/${hashOrNumber}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getBlock error:', error);
      return null;
    }
  },

  /**
   * TOKENS API
   */
  
  // Get token information
  async getTokenInfo(tokenId: string, timestamp?: string): Promise<HederaToken | null> {
    try {
      const url = timestamp 
        ? `${HEDERA_MIRROR_NODE_URL}/tokens/${tokenId}?timestamp=${timestamp}`
        : `${HEDERA_MIRROR_NODE_URL}/tokens/${tokenId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getTokenInfo error:', error);
      return null;
    }
  },

  // Get token supply distribution
  async getTokenBalances(tokenId: string, params: {
    accountId?: string;
    accountBalance?: string;
    accountPublicKey?: string;
    limit?: number;
    order?: 'asc' | 'desc';
    timestamp?: string;
  } = {}): Promise<any[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.accountId) query.append('account.id', params.accountId);
      if (params.accountBalance) query.append('account.balance', params.accountBalance);
      if (params.accountPublicKey) query.append('account.publickey', params.accountPublicKey);
      if (params.timestamp) query.append('timestamp', params.timestamp);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/tokens/${tokenId}/balances?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.balances || [];
    } catch (error) {
      console.error('getTokenBalances error:', error);
      return [];
    }
  },

  // Get NFTs for a token
  async getTokenNFTs(tokenId: string, params: {
    accountId?: string;
    limit?: number;
    order?: 'asc' | 'desc';
    serialNumber?: string;
  } = {}): Promise<HederaNFT[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.accountId) query.append('account.id', params.accountId);
      if (params.serialNumber) query.append('serialnumber', params.serialNumber);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/tokens/${tokenId}/nfts?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.nfts || [];
    } catch (error) {
      console.error('getTokenNFTs error:', error);
      return [];
    }
  },

  // Get specific NFT
  async getNFT(tokenId: string, serialNumber: number): Promise<HederaNFT | null> {
    try {
      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/tokens/${tokenId}/nfts/${serialNumber}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getNFT error:', error);
      return null;
    }
  },

  // Get NFT transaction history
  async getNFTTransactionHistory(tokenId: string, serialNumber: number, params: {
    limit?: number;
    order?: 'asc' | 'desc';
    timestamp?: string;
  } = {}): Promise<any[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.timestamp) query.append('timestamp', params.timestamp);

      const response = await fetch(
        `${HEDERA_MIRROR_NODE_URL}/tokens/${tokenId}/nfts/${serialNumber}/transactions?${query}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('getNFTTransactionHistory error:', error);
      return [];
    }
  },

  /**
   * NETWORK API
   */
  
  // Get exchange rate
  async getExchangeRate(timestamp?: string): Promise<any> {
    try {
      const url = timestamp
        ? `${HEDERA_MIRROR_NODE_URL}/network/exchangerate?timestamp=${timestamp}`
        : `${HEDERA_MIRROR_NODE_URL}/network/exchangerate`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('getExchangeRate error:', error);
      return null;
    }
  },

  // Get network fees
  async getNetworkFees(params: {
    order?: 'asc' | 'desc';
    timestamp?: string;
  } = {}): Promise<any> {
    try {
      const query = new URLSearchParams();
      if (params.order) query.append('order', params.order);
      if (params.timestamp) query.append('timestamp', params.timestamp);

      const queryStr = query.toString();
      const url = `${HEDERA_MIRROR_NODE_URL}/network/fees${queryStr ? '?' + queryStr : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('getNetworkFees error:', error);
      return null;
    }
  },

  // Get consensus nodes
  async getNetworkNodes(params: {
    fileId?: string;
    limit?: number;
    nodeId?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<any[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 100).toString(),
        order: params.order || 'asc'
      });
      if (params.fileId) query.append('file.id', params.fileId);
      if (params.nodeId) query.append('node.id', params.nodeId);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/network/nodes?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.nodes || [];
    } catch (error) {
      console.error('getNetworkNodes error:', error);
      return [];
    }
  },

  // Get network staking information
  async getNetworkStake(): Promise<HederaNetworkStake | null> {
    try {
      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/network/stake`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getNetworkStake error:', error);
      return null;
    }
  },

  // Get HBAR supply
  async getNetworkSupply(timestamp?: string): Promise<any> {
    try {
      const url = timestamp
        ? `${HEDERA_MIRROR_NODE_URL}/network/supply?timestamp=${timestamp}`
        : `${HEDERA_MIRROR_NODE_URL}/network/supply`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('getNetworkSupply error:', error);
      return null;
    }
  },

  /**
   * CONTRACTS API
   */
  
  // List smart contracts
  async getContracts(params: {
    contractId?: string;
    limit?: number;
    order?: 'asc' | 'desc';
  } = {}): Promise<any[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.contractId) query.append('contract.id', params.contractId);

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/contracts?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.contracts || [];
    } catch (error) {
      console.error('getContracts error:', error);
      return [];
    }
  },

  // Get contract details
  async getContract(contractIdOrAddress: string, timestamp?: string): Promise<any> {
    try {
      const url = timestamp
        ? `${HEDERA_MIRROR_NODE_URL}/contracts/${contractIdOrAddress}?timestamp=${timestamp}`
        : `${HEDERA_MIRROR_NODE_URL}/contracts/${contractIdOrAddress}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getContract error:', error);
      return null;
    }
  },

  // Get contract execution results
  async getContractResults(contractIdOrAddress: string, params: {
    blockHash?: string;
    blockNumber?: string;
    from?: string;
    internal?: boolean;
    limit?: number;
    order?: 'asc' | 'desc';
    timestamp?: string;
    transactionIndex?: number;
  } = {}): Promise<any[]> {
    try {
      const query = new URLSearchParams({
        limit: (params.limit || 25).toString(),
        order: params.order || 'desc'
      });
      if (params.blockHash) query.append('block.hash', params.blockHash);
      if (params.blockNumber) query.append('block.number', params.blockNumber);
      if (params.from) query.append('from', params.from);
      if (params.internal !== undefined) query.append('internal', params.internal.toString());
      if (params.timestamp) query.append('timestamp', params.timestamp);
      if (params.transactionIndex !== undefined) query.append('transaction.index', params.transactionIndex.toString());

      const response = await fetch(`${HEDERA_MIRROR_NODE_URL}/contracts/${contractIdOrAddress}/results?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('getContractResults error:', error);
      return [];
    }
  },

  /**
   * UTILITY METHODS
   */
  
  // Convert tinybars to HBAR
  tinybarsToHbar(tinybars: number): number {
    return tinybars / 100000000;
  },

  // Convert HBAR to tinybars
  hbarToTinybars(hbar: number): number {
    return Math.floor(hbar * 100000000);
  },

  // Format timestamp
  formatTimestamp(timestamp: string): Date {
    const [seconds, nanoseconds] = timestamp.split('.');
    return new Date(parseInt(seconds) * 1000 + parseInt(nanoseconds) / 1000000);
  },

  // Build comparison query parameter
  buildComparison(operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte', value: string | number): string {
    return `${operator}:${value}`;
  }
};

export default enhancedHederaService;
