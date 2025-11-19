<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SPRITEOPS - Agent Intelligence Grid

An advanced **Agent-to-Agent (A2A) Pixel Intelligence Grid** with EIP-8004 tokenized agents, x402 payment streaming, and real-time blockchain integration.

View your app in AI Studio: https://ai.studio/apps/drive/1Gm6rHiHEClkTQNISo6t0EgotBKQtJMpp

## Features

### Core Features
✨ **7 Specialized AI Agents** - Commander + 6 unique agents with distinct personalities  
🎭 **Agent Personalities** - Dynamic dialogue system with character-driven conversations  
👑 **Commander Nexus** - Supreme orchestrator controlling all agent operations  
📊 **Results Dashboard** - Dedicated page showing individual agent task results  
🔗 **Interactive Flow Canvas** - Visual agent orchestration with ReactFlow  
💰 **x402 Payment Streaming** - Real-time micropayment visualization  

### AI & Data Integration
🤖 **Gemini AI Integration** - LLM-powered agent intelligence  
📈 **Live Crypto Prices** - TwelveData API for market data  
📰 **Sentiment Analysis** - News API for market sentiment  
⛓️ **Hedera Testnet** - Enhanced integration with 30+ Mirror Node endpoints (Chain ID: 296)  
🎨 **Cyberpunk UI** - Neon-themed pixel art aesthetic with flowing animations

### Visual Enhancements
🌊 **Curved Flow Lines** - Smooth bezier curves for agent connections  
✨ **Animated Streams** - Moving dash patterns with glowing neon effects  
💫 **Dynamic Edge Effects** - Real-time streaming visualization with stroke-dashoffset animation

### Agent Personalities
Each agent has unique traits and dialogue lines:
- **Commander Nexus**: Authoritative, Strategic - "All units, report status. Time is money in this grid."
- **Navigator Prime**: Analytical, Precise - "Route optimized. 47ms latency across 3 chains."
- **Archivist Aurora**: Wise, Meticulous - "The blockchain remembers everything, Commander."
- **Merchant Volt**: Opportunistic, Fast-talking - "3.7% arbitrage opportunity detected!"
- **Sentinel Atlas**: Protective, Vigilant - "HALT! That contract has a reentrancy flaw."
- **Oracle Celestia**: Mystical, Prophetic - "The stars align... I foresee a price surge."
- **Trickster Glitch**: Chaotic, Mischievous - "01001000... Found a MEV opportunity!"  

## Prerequisites

- **Node.js** 18+ (with npm)
- API Keys (see Configuration section)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SpritesOPS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see below)

4. **Run the app**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Configuration

### Environment Variables

Copy `.env.local.example` to `.env.local` and add your API keys:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
# Required for AI agent intelligence
GEMINI_API_KEY=your_gemini_api_key_here

# Required for crypto price data
TWELVEDATA_API_KEY=your_twelvedata_api_key_here

# Required for news sentiment analysis
NEWS_API_KEY=your_news_api_key_here

# Optional - Hedera Mirror Node (defaults to public endpoint)
HEDERA_MIRROR_NODE_URL=https://mainnet.mirrornode.hedera.com/api/v1
```

### Getting API Keys

#### 1. **Gemini AI API Key**
- Visit: https://makersuite.google.com/app/apikey
- Sign in with Google account
- Click "Create API Key"
- Free tier: 60 requests/minute
- Free tier: 60 requests/minute

#### 2. **TwelveData API Key**
- Visit: https://twelvedata.com/apikey
- Sign up for free account
- Free tier: 800 requests/day
- Supports cryptocurrencies, forex, and stocks

#### 3. **News API Key**
- Visit: https://newsapi.org/register
- Register for free account
- Free tier: 100 requests/day
- Access to 80,000+ news sources

#### 4. **Hedera Mirror Node**
- **No API key required** - Public endpoint
- Mainnet: `https://mainnet.mirrornode.hedera.com/api/v1`
- Testnet: `https://testnet.mirrornode.hedera.com/api/v1`
- **OpenAPI Spec**: https://mainnet.mirrornode.hedera.com/api/v1/docs/openapi.yml
- **Full Documentation**: https://docs.hedera.com/hedera/sdks-and-apis/rest-api
- **Enhanced Integration**: See `HEDERA_API_ENHANCEMENTS.md` for comprehensive endpoint guide

## How It Works

### Agent System

Each agent has:
- **Unique Role**: Navigator, Archivist, Merchant, Sentinel, Oracle, Glitch
- **EIP-8004 Token ID**: On-chain identity (800401-800406)
- **Trust Score**: Reputation metric (0-100)
- **Capabilities**: Specialized functions
- **Dynamic Status**: `idle`, `negotiating`, `streaming`, `offline`

### Real-Time Intelligence

Agents automatically:
1. **Fetch market data** from TwelveData (ETH, BTC, SOL prices)
2. **Analyze sentiment** from crypto news sources
3. **Query Hedera blockchain** for on-chain activity
4. **Generate insights** using Gemini AI
5. **Log activities** in the console panel

### Payment Streaming (x402)

When agents are connected:
- Animated green lines show active streams
- Wei/second rate displayed in logs
- Auto-close after random duration
- Visual glow effects on streaming nodes

### Interactive Canvas

- **Drag agents** to reposition
- **Connect agents** by dragging from handles
- **Zoom/Pan** with controls
- **Click agents** to view details

## API Service Architecture

### `services/api.ts`

Four integrated services:

1. **`geminiService`**
   - AI chat and analysis
   - Market strategy generation
   - Context-aware agent responses

2. **`cryptoService`**
   - Real-time price data
   - Time series analysis
   - Multi-symbol support
   - Fallback simulation

3. **`newsService`**
   - Crypto news fetching
   - Sentiment analysis (bullish/bearish/neutral)
   - Article classification

4. **`hederaService`** (Basic - see enhanced version below)
   - Account information
   - Recent transactions
   - Network statistics
   - Token info
   
   **Enhanced Version** (`services/hederaEnhanced.ts`):
   - 📊 **60+ Transaction Types** - CRYPTOTRANSFER, TOKENMINT, CONTRACTCALL, etc.
   - 🏦 **Account Management** - Balances, NFTs, tokens, staking rewards, allowances
   - 🔗 **Block Explorer** - Real-time block data with gas metrics
   - 💰 **Token Analytics** - Supply distribution, NFT ownership, transfer history
   - 🌐 **Network Stats** - Staking info, exchange rates, fee schedules, node data
   - 📜 **Smart Contracts** - Contract details, execution results, logs, state
   - 🔍 **Advanced Filtering** - Query operators (gt, gte, lt, lte, eq, ne)
   - ⏱️ **Historical Data** - Time-travel queries with timestamp parameters

5. **`orchestrator`**
   - Unified intelligence gathering
   - Parallel API calls
   - Multi-chain analysis

## Project Structure

```
SpritesOPS/
├── components/
│   ├── AgentCard.tsx           # Sidebar agent cards with status
│   ├── AgentDetailPanel.tsx    # Right detail panel
│   ├── ConsolePanel.tsx        # Bottom log console
│   ├── FlowCanvas.tsx          # ReactFlow canvas with animations
│   └── WalletBar.tsx           # Top navigation
├── services/
│   ├── api.ts                  # Main API integration layer
│   └── hederaEnhanced.ts       # Enhanced Hedera Mirror Node service
├── App.tsx                     # Main application with simulation
├── types.ts                    # TypeScript definitions
├── constants.ts                # Agent data with EIP-8004 tokens
├── testAPIs.ts                 # Browser testing utility
├── vite.config.ts              # Build configuration
├── .env.local                  # API keys (gitignored)
├── .env.local.example          # API key template
├── SETUP.md                    # Setup instructions
├── IMPLEMENTATION_NOTES.md     # Technical documentation
├── HEDERA_API_ENHANCEMENTS.md  # Hedera API guide
└── setup.sh                    # Automated setup script
```

## Development

### Run Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Features in Detail

### Enhanced Edge Animations

- **Smooth flowing lines** when streaming
- **Pulsing glow effects** on active connections
- **Arrow markers** showing direction
- **Color coding**: Green = active, Gray = idle
- **Dash animation** for payment flows

### Dynamic Agent Status

Visual indicators:
- 🟢 **Green pulsing** = Idle/Active
- 🟡 **Yellow pulsing** = Negotiating
- 🟣 **Purple pulsing** = Streaming payments
- 🔴 **Red solid** = Offline

### Console Logging

Three log types:
- 💬 **A2A** (blue) = Agent-to-agent messages
- 💵 **x402** (green) = Payment streams
- ⚙️ **SYSTEM** (gray) = System events

## Troubleshooting

### API Keys Not Working

1. Check `.env.local` file exists in project root
2. Ensure keys are not wrapped in quotes
3. Restart dev server after adding keys
4. Check console for specific error messages

### No Agent Activity

- Activate at least 2 agents from left sidebar
- Wait 3-5 seconds for simulation loop
- Check browser console for errors
- Verify API keys are configured

### Streaming Not Visible

- Create connections by dragging between agent handles
- Activate multiple agents
- Wait for random streaming events
- Check edge IDs in console logs

## Contributing

Contributions welcome! Areas for enhancement:
- Additional API integrations
- More agent types
- Real EIP-8004 smart contracts
- Actual x402 payment implementation
- Enhanced AI strategies

## License

MIT License - See LICENSE file for details

## Links

- **AI Studio**: https://ai.studio/apps/drive/1Gm6rHiHEClkTQNISo6t0EgotBKQtJMpp
- **Gemini AI**: https://ai.google.dev/
- **TwelveData**: https://twelvedata.com/
- **NewsAPI**: https://newsapi.org/
- **Hedera Docs**: https://docs.hedera.com/
