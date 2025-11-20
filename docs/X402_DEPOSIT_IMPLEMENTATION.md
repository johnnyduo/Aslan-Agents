# x402 Deposit Implementation

## Overview
Implemented real on-chain deposit functionality for funding the Captain (Commander Agent) via x402 streaming payments. This allows users to deposit HBAR or USDC that the Captain can autonomously use to pay other agents for tasks.

## Smart Contract Integration

### X402Streaming Contract
- **Address**: `0x805492D120C29A4933FB1D3FfCe944A2D42222F4`
- **Network**: Hedera Testnet (Chain ID: 296)
- **Features**:
  - Real-time micropayments via streaming
  - Spending caps and rate limits
  - Auto-close on budget exhaustion
  - Support for both HBAR and USDC

### Key Functions
1. **openStream()**: Opens a payment stream from Captain to an agent
   - Parameters: senderAgentId, receiverAgentId, ratePerSecond, spendingCap, asset
   - Requires ERC20 approval for USDC
   - Can send native HBAR directly

2. **pushPayments()**: Processes accumulated payments (keeper function)
3. **closeStream()**: Closes stream and returns unused funds
4. **withdraw()**: Receiver withdraws accumulated payments

## Implementation Files

### 1. `hooks/useX402Deposit.ts`
Custom React hooks for x402 operations:

- **useX402Deposit()**: Main deposit functionality
  - Handles USDC approval workflow
  - Opens streaming payment channels
  - Returns transaction status and errors
  
- **useX402StreamData()**: Read stream information
  - Stream details (sender, receiver, rate, cap)
  - Remaining allowance
  - Amount owed

- **useX402PushPayments()**: Keeper function to process payments
- **useX402CloseStream()**: Close active streams
- **useX402Withdraw()**: Withdraw earned payments

### 2. `components/DepositModal.tsx`
User interface for depositing funds:

**Features**:
- Asset selection (HBAR or USDC)
- Amount input with validation
- Receiver agent ID selection
- Payment rate configuration (per second)
- Duration calculator
- Multi-step workflow:
  1. Form input
  2. USDC approval (if needed)
  3. Stream opening transaction
  4. Success confirmation

**User Experience**:
- Real-time duration calculation
- Transaction status indicators
- HashScan explorer links
- Error handling with clear messages

### 3. `components/WalletBar.tsx`
Added "Fund Balance" button:
- Only visible when wallet connected
- Opens deposit modal
- Positioned next to Results button

### 4. `App.tsx`
Integration changes:
- Imported DepositModal component
- Added showDepositModal state
- Connected modal to WalletBar button
- Logs successful deposits to console

### 5. `contracts/abis/X402Streaming.json`
Complete ABI for X402Streaming contract:
- All function signatures
- Event definitions
- Struct types (StreamData)

### 6. `config/walletConfig.ts`
Exported contract addresses:
- USDC_ADDRESS
- EIP8004_ADDRESS  
- X402_STREAMING_ADDRESS

## Workflow

### For USDC Deposits:
1. User clicks "Fund Balance" button
2. Enters amount, receiver agent ID, and payment rate
3. Clicks "OPEN x402 STREAM"
4. **Step 1**: Approve USDC spending
   - User signs approval transaction
   - Wait for confirmation
5. **Step 2**: Open stream
   - User signs stream creation transaction
   - Funds transferred to escrow
   - Stream begins immediately
6. Success! Stream ID returned

### For HBAR Deposits:
1-3. Same as above
4. **Single Step**: Open stream with native HBAR
   - No approval needed
   - HBAR sent directly with transaction
5. Success! Stream active

## Agent Usage

Once deposited, the Captain can:
- Use funds for autonomous operations
- Pay other agents for tasks via streams
- Monitor remaining balance
- Close streams to recover unused funds

Agents receiving payments can:
- Withdraw accumulated payments anytime
- See real-time payment flow
- Auto-receive when cap is reached

## Technical Details

### Payment Rate Examples:
- **0.0001 USDC/s** = ~$0.36/hour = ~$8.64/day
- **0.001 USDC/s** = ~$3.60/hour = ~$86.40/day  
- **0.00001 HBAR/s** = ~0.036 HBAR/hour

### Spending Cap:
- Maximum total amount that can be streamed
- Stream auto-closes when cap reached
- Unused funds returned to sender

### Gas Optimization:
- Keeper pattern for payment processing
- Anyone can call pushPayments()
- Batch processing of accumulated payments
- Minimal gas per payment push

## Security Features

1. **Agent Verification**: Only active EIP-8004 agents can participate
2. **Owner Authorization**: Only agent owners can open/close streams
3. **Spending Caps**: Hard limits prevent overspending
4. **Reentrancy Protection**: SafeERC20 and ReentrancyGuard
5. **Escrow Model**: Funds held in contract until withdrawn

## Future Enhancements

- [ ] Multi-stream management UI
- [ ] Stream analytics dashboard
- [ ] Automated keeper service
- [ ] Stream rate adjustment interface
- [ ] Batch stream creation
- [ ] Stream templates for common tasks
- [ ] Integration with agent task assignment

## Testing

To test the deposit functionality:

1. Connect wallet with USDC or HBAR balance
2. Click "Fund Balance" in top bar
3. Enter deposit details (recommend 0.1 USDC for testing)
4. Complete approval (USDC only)
5. Confirm stream creation
6. Check HashScan for transaction details

View streams on-chain:
```javascript
// Read stream data
const streamData = await contract.getStreamData(streamId);
console.log(streamData);
```

## Contract Explorer
- **HashScan**: https://hashscan.io/testnet/contract/0.0.5183604
- **Mirror Node**: https://testnet.mirrornode.hedera.com/api/v1/contracts/0.0.5183604

---

**Status**: ✅ Fully Implemented and Ready for Testing
**Network**: Hedera Testnet
**Last Updated**: November 20, 2025
