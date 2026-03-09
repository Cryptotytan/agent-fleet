import React from 'react';
import ReactMarkdown from 'react-markdown';

const SKILLS_MD = `# AGENTIC Wallet Platform — SKILLS.md

## Overview
This platform enables AI agents to autonomously manage Solana wallets on Devnet.

## Agent Types

### TRADER
- Monitors mock token prices
- Executes buy/sell signals via SOL transfers
- Decision threshold: buy < 50, sell > 80
- Runs every 15 seconds

### LIQUIDITY
- Rebalances SOL across peer agent wallets
- Splits balance in configurable ratios (10% per cycle)
- Runs on 15-second intervals

### MONITOR
- Tracks all agent wallet balances in real-time
- Fires visual alerts on low-balance conditions (< 0.1 SOL)
- Logs all agent activity to global feed

## Wallet Capabilities

| Function | Description |
|---|---|
| createWallet() | Generates Keypair, returns publicKey + encrypted secret |
| signTransaction(tx, keypair) | Signs without user input or wallet popups |
| airdropSOL(publicKey, amount) | Requests devnet SOL (max 2 SOL) |
| getBalance(publicKey) | Returns lamports, converts to SOL |
| sendSOL(from, to, amount) | Builds + signs + sends transfer |

## RPC Endpoint
\`\`\`
https://api.devnet.solana.com
\`\`\`

## Security Model
- Private keys encrypted in memory (XOR + passphrase)
- Keys never exposed in UI or console logs
- Signing separated from decision logic
- Devnet only — no mainnet configuration

## Extending Agents
\`\`\`js
decide(balance, context) → returns { action, amount, reason } | null
execute(action, walletData, peers) → returns txSignature
\`\`\`

## Transaction Flow
\`\`\`
Agent Loop (every N seconds):
  1. getBalance(publicKey)
  2. Run decision logic
  3. If action required → buildTransaction()
  4. signTransaction(keypair)
  5. sendAndConfirmTransaction()
  6. Log result to global feed
\`\`\`

## Constraints & Limits
- Max airdrop: 2 SOL per request
- Min transfer: 0.01 SOL
- Loop interval: configurable (default 15s)
- Max tx rate: 1 per loop cycle
- Network: Devnet ONLY

## ⚠️ Safety Guardrails
- Agents will not transfer if balance < 0.2 SOL
- No mainnet RPC endpoints allowed
- All keys stored encrypted, never in plaintext
- Page refresh preserves wallets via persistent storage
`;

export default function SkillsPanel() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 style={{ color: '#00ff87', fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ color: '#e8eaf0', fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600, marginTop: 16, marginBottom: 6 }}>{children}</h3>,
          p:  ({ children }) => <p  style={{ color: '#8892a4', fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>{children}</p>,
          li: ({ children }) => <li style={{ color: '#8892a4', fontSize: 13, lineHeight: 1.8, marginLeft: 16 }}>{children}</li>,
          code: ({ inline, children }) => inline
            ? <code style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#00ff87', background: 'rgba(0,255,135,0.08)', padding: '2px 6px', borderRadius: 4 }}>{children}</code>
            : <pre style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#e8eaf0', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: 8, overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}><code>{children}</code></pre>,
          table:  ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>{children}</table>,
          th: ({ children }) => <th style={{ color: '#00ff87', fontFamily: 'JetBrains Mono', fontSize: 11, textAlign: 'left', padding: '6px 12px', borderBottom: '1px solid rgba(0,255,135,0.2)' }}>{children}</th>,
          td: ({ children }) => <td style={{ color: '#8892a4', fontSize: 12, padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{children}</td>,
          strong: ({ children }) => <strong style={{ color: '#e8eaf0' }}>{children}</strong>,
        }}
      >
        {SKILLS_MD}
      </ReactMarkdown>
    </div>
  );
                                            }
