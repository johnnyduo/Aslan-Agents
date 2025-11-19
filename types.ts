export enum AgentRole {
  NAVIGATOR = 'Navigator',
  ARCHIVIST = 'Archivist',
  MERCHANT = 'Merchant',
  SENTINEL = 'Sentinel',
  ORACLE = 'Oracle',
  GLITCH = 'Glitch',
}

export interface AgentMetadata {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  capabilities: string[];
  tokenId: number; // EIP-8004
  trustScore: number;
  walletAddress: string;
  spriteSeed: string;
  hfPrompt: string; // The prompt used to generate the sprite (conceptual)
  status: 'idle' | 'negotiating' | 'streaming' | 'offline';
}

export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'A2A' | 'x402' | 'SYSTEM';
  content: string;
  agentId?: string;
}

export interface StreamState {
  id: string;
  source: string;
  target: string;
  rate: number; // wei per second
  totalStreamed: number;
  active: boolean;
}

export enum MessageType {
  SERVICE_REQUEST = 'SERVICE_REQUEST',
  SERVICE_OFFER = 'SERVICE_OFFER',
  STREAM_OPEN = 'STREAM_OPEN',
  STREAM_CLOSE = 'STREAM_CLOSE',
}