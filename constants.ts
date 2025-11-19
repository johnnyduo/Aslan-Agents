import { AgentRole, AgentMetadata } from './types';

const HF_PREFIX = "8-bit and 16-bit hybrid pixel art, cute and adorable chibi superhero trainer, lightsaber green themed, glowing neon green accents on costume and outline, inspired by Marvel-style heroes and Disney animation but fully original, vibrant colors, clean pixel clusters, strong contrast, professional sprite sheet for RPG games,";
const HF_SUFFIX = "full top-down RPG sprite sheet, 4x4 grid, 16 frames total, each frame 96x96 pixels, walking animation in 4 directions (down, left, right, up), 4 frames per direction, transparent background, no UI, no text, no borders, character centered consistently, ready for game engines like RPGJS or Phaser.";

export const AGENTS: AgentMetadata[] = [
  {
    id: 'a0',
    name: 'Commander Nexus',
    role: AgentRole.COMMANDER,
    description: 'Supreme orchestrator. Coordinates all agents and strategic decisions.',
    capabilities: ['Strategic Planning', 'Agent Coordination', 'Risk Management', 'Decision Making'],
    tokenId: 800400,
    trustScore: 100,
    walletAddress: '0xFF...AAAA',
    spriteSeed: 'commander',
    status: 'idle',
    hfPrompt: `${HF_PREFIX} majestic golden armor with neon green command insignia, glowing tactical visor, holographic command interface, authoritative stance ${HF_SUFFIX}`,
    personality: {
      traits: ['Authoritative', 'Strategic', 'Decisive', 'Protective'],
      dialogues: [
        'All units, report status. Time is money in this grid.',
        'Navigator, chart the optimal route. Merchant, calculate the spread.',
        'Excellent work, team. The grid operates at peak efficiency.',
        'Sentinel, audit that contract before we proceed. No risks.',
        'Oracle, what do your predictions show for the next block?',
        'Glitch... try not to break anything this time.'
      ]
    }
  },
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
    hfPrompt: `${HF_PREFIX} teal and neon green cloak with holographic path lines, holding a glowing digital compass ${HF_SUFFIX}`,
    personality: {
      traits: ['Analytical', 'Precise', 'Calm', 'Methodical'],
      dialogues: [
        'Route optimized. 47ms latency across 3 chains.',
        'Bridge aggregation complete. Path efficiency: 94.2%.',
        'Commander, I\'ve found a faster route through Polygon.',
        'Interesting... detecting unusual cross-chain activity.',
        'All pathways mapped. Ready for deployment.',
        'Sometimes the longest route is the safest one.'
      ]
    }
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
    hfPrompt: `${HF_PREFIX} indigo robes with floating green runes and a large holographic scroll, wise expression ${HF_SUFFIX}`,
    personality: {
      traits: ['Wise', 'Meticulous', 'Patient', 'Knowledgeable'],
      dialogues: [
        'Accessing historical ledger... block 15,847,293 indexed.',
        'The blockchain remembers everything, Commander.',
        'Found a pattern from 6 months ago. History repeats itself.',
        'I have catalogued every transaction since genesis.',
        'Knowledge is power, but wisdom is knowing when to use it.',
        'Let me consult the ancient blocks... ah, yes, I recall this.'
      ]
    }
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
    hfPrompt: `${HF_PREFIX} sleek purple jacket with a high-tech neon green visor and digital coins floating around ${HF_SUFFIX}`,
    personality: {
      traits: ['Opportunistic', 'Fast-talking', 'Greedy', 'Sharp'],
      dialogues: [
        '3.7% arbitrage opportunity detected! Moving in!',
        'Time is money, folks. Let\'s make this quick.',
        'Cha-ching! Another successful trade. Who\'s buying lunch?',
        'I smell profit... 0.003 ETH spread on Uniswap.',
        'Flash loan approved. Executing in 200ms.',
        'Commander, with all due respect, we\'re leaving money on the table!'
      ]
    }
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
    hfPrompt: `${HF_PREFIX} heavy black armor with neon green energy shield generator and tactical visor ${HF_SUFFIX}`,
    personality: {
      traits: ['Protective', 'Vigilant', 'Serious', 'Duty-bound'],
      dialogues: [
        'Security scan complete. Zero vulnerabilities detected.',
        'HALT! That contract has a reentrancy flaw.',
        'Protection protocols active. The grid is secure.',
        'I don\'t trust that address. Running full audit now.',
        'Commander, recommend we abort. Risk level: CRITICAL.',
        'No threats on my watch. Shield systems at 100%.'
      ]
    }
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
    hfPrompt: `${HF_PREFIX} violet mystical robe with levitating green crystal orbs and starry eyes ${HF_SUFFIX}`,
    personality: {
      traits: ['Mystical', 'Prophetic', 'Enigmatic', 'Intuitive'],
      dialogues: [
        'The stars align... I foresee a price surge in 3 blocks.',
        'My visions show turbulence ahead. Proceed with caution.',
        'The oracle speaks: ETH will touch $3,847 by midnight.',
        'I sense a disturbance in the mempool...',
        'The future is fluid, but the patterns are clear.',
        'Trust in my sight, Commander. I have never been wrong.'
      ]
    }
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
    hfPrompt: `${HF_PREFIX} fragmented digital form with glitch effects, binary code aura, and mischievous grin ${HF_SUFFIX}`,
    personality: {
      traits: ['Chaotic', 'Unpredictable', 'Mischievous', 'Clever'],
      dialogues: [
        '01001000 01100001 01101000 01100001! Found a MEV opportunity!',
        'Oops... did I just front-run everyone? My bad! (Not sorry)',
        'Chaos is just order waiting to be decoded.',
        'Atlas, your shields are cute. Wanna see a bug I found?',
        'The grid is too stable. Time to spice things up!',
        'Commander says don\'t break things. But where\'s the fun in that?'
      ]
    }
  }
];

export const INITIAL_LOGS: any[] = [
  { id: 'sys-1', timestamp: '10:00:00', type: 'SYSTEM', content: 'SpriteOps Grid Initialized. EIP-8004 Registry Loaded.' },
  { id: 'sys-2', timestamp: '10:00:01', type: 'SYSTEM', content: 'x402 Payment Engine Ready.' },
];