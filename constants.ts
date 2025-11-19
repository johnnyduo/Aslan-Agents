import { AgentRole, AgentMetadata } from './types';

const HF_PREFIX = "8-bit and 16-bit hybrid pixel art, cute and adorable chibi superhero trainer, lightsaber green themed, glowing neon green accents on costume and outline, inspired by Marvel-style heroes and Disney animation but fully original, vibrant colors, clean pixel clusters, strong contrast, professional sprite sheet for RPG games,";
const HF_SUFFIX = "full top-down RPG sprite sheet, 4x4 grid, 16 frames total, each frame 96x96 pixels, walking animation in 4 directions (down, left, right, up), 4 frames per direction, transparent background, no UI, no text, no borders, character centered consistently, ready for game engines like RPGJS or Phaser.";

export const AGENTS: AgentMetadata[] = [
  {
    id: 'a1',
    name: 'Navigator Prime',
    role: AgentRole.NAVIGATOR,
    description: 'Routing, chains, discovery. Optimizes paths across the multi-chain verse.',
    capabilities: ['Pathfinding', 'Bridge Aggregation', 'Latency Optimization'],
    tokenId: 800401,
    trustScore: 98,
    walletAddress: '0x71...A9f2',
    spriteSeed: 'navigator',
    status: 'idle',
    hfPrompt: `${HF_PREFIX} teal and neon green cloak with holographic path lines, holding a glowing digital compass ${HF_SUFFIX}`
  },
  {
    id: 'a2',
    name: 'Archivist Aurora',
    role: AgentRole.ARCHIVIST,
    description: 'Dataset curation and ledger indexing. The memory of the grid.',
    capabilities: ['Data Indexing', 'Storage Proofs', 'Historical Query'],
    tokenId: 800402,
    trustScore: 99,
    walletAddress: '0x3B...22c1',
    spriteSeed: 'archivist',
    status: 'idle',
    hfPrompt: `${HF_PREFIX} indigo robes with floating green runes and a large holographic scroll, wise expression ${HF_SUFFIX}`
  },
  {
    id: 'a3',
    name: 'Merchant Volt',
    role: AgentRole.MERCHANT,
    description: 'Flash arbitrage and liquidity provision. High-frequency negotiator.',
    capabilities: ['Arbitrage', 'Liquidity Sniping', 'Market Making'],
    tokenId: 800403,
    trustScore: 85,
    walletAddress: '0x99...dE4a',
    spriteSeed: 'merchant',
    status: 'idle',
    hfPrompt: `${HF_PREFIX} sleek purple jacket with a high-tech neon green visor and digital coins floating around ${HF_SUFFIX}`
  },
  {
    id: 'a4',
    name: 'Sentinel Atlas',
    role: AgentRole.SENTINEL,
    description: 'Smart contract auditing and risk assessment. The shield.',
    capabilities: ['Security Audit', 'Risk Analysis', 'Invariant Checking'],
    tokenId: 800404,
    trustScore: 100,
    walletAddress: '0x11...Af33',
    spriteSeed: 'sentinel',
    status: 'idle',
    hfPrompt: `${HF_PREFIX} heavy black armor with neon green energy shield generator and tactical visor ${HF_SUFFIX}`
  },
  {
    id: 'a5',
    name: 'Oracle Celestia',
    role: AgentRole.ORACLE,
    description: 'Forecasting and outcome verification. Sees the future blocks.',
    capabilities: ['Price Feeds', 'Event Resolution', 'Randomness Gen'],
    tokenId: 800405,
    trustScore: 96,
    walletAddress: '0xCC...881b',
    spriteSeed: 'oracle',
    status: 'idle',
    hfPrompt: `${HF_PREFIX} violet mystical robe with levitating green crystal orbs and starry eyes ${HF_SUFFIX}`
  },
  {
    id: 'a6',
    name: 'Trickster Glitch',
    role: AgentRole.GLITCH,
    description: 'MEV extraction and chaotic stress testing. The anomaly.',
    capabilities: ['MEV Simulation', 'Chaos Engineering', 'Stress Testing'],
    tokenId: 800406,
    trustScore: 42,
    walletAddress: '0x00...0000',
    spriteSeed: 'glitch',
    status: 'idle',
    hfPrompt: `${HF_PREFIX} fragmented digital form with glitch effects, binary code aura, and mischievous grin ${HF_SUFFIX}`
  }
];

export const INITIAL_LOGS: any[] = [
  { id: 'sys-1', timestamp: '10:00:00', type: 'SYSTEM', content: 'SpriteOps Grid Initialized. EIP-8004 Registry Loaded.' },
  { id: 'sys-2', timestamp: '10:00:01', type: 'SYSTEM', content: 'x402 Payment Engine Ready.' },
];