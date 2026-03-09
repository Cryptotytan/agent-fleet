# agent-fleet

# AGENTIC — Autonomous Wallet Platform on Solana Devnet

> A high-performance terminal for managing autonomous AI agents that execute 
> programmatic transactions using persistent, encrypted wallets on Solana Devnet.

---

## What It Does

AGENTIC lets you deploy and observe multiple AI agents — each with their own 
Solana devnet wallet — that autonomously make trading, liquidity, and monitoring 
decisions in real time.

### Agent Archetypes

| Type | Behavior |
|------|----------|
| **TRADER** | Buys when price < 50, sells when price > 80. Auto stop-loss at -80%, take-profit at +50% from entry. Tracks open position P&L. |
| **LIQUIDITY** | Rebalances 10% of balance across peer agents every cycle |
| **MONITOR** | Watches all wallet balances and fires alerts when any drops below 0.1 SOL |

---

## Architecture

┌─────────────────────────────────────────────────┐ │ React Frontend │ │ pages/Agents ──► AgentCard (per agent UI) │ │ pages/Transactions ──► history table │ │ pages/Volume ──► analytics charts │ │ pages/Skills ──► this documentation │ └──────────────┬──────────────────────────────────┘ │ ┌───────────▼───────────┐ ┌──────────────────────┐ │ components/ │ │ Base44 Backend DB │ │ solanaEngine.js │ │ Agent entity │ │ (wallet create, │◄──►│ Transaction entity │ │ sign, send, balance) │ │ (persistent across │ └───────────┬────────────┘ │ page reloads) │ │ └──────────────────────┘ ┌───────────▼────────────┐ │ components/ │ │ agentEngine.js │ │ (decision logic, │ │ stop-loss, │ │ take-profit, │ │ mock price feed) │ └────────────────────────┘ │ ┌───────────▼────────────┐ │ Solana Devnet RPC │ │ api.devnet.solana.com │ └────────────────────────┘


---

## Features

- **Programmatic wallet creation** — Solana keypairs generated client-side via `@solana/web3.js`
- **Encrypted key storage** — XOR-encrypted with a devnet passphrase, stored in Base44 DB
- **Autonomous transaction signing** — agents sign and submit real devnet transactions without user input
- **Multi-agent fleet** — TRADER, LIQUIDITY, MONITOR each run independently on 15s intervals
- **Persistent agent state** — start/stop status survives page reloads via DB
- **Username sessions** — each user gets isolated data under `agentic_data_<username>` in localStorage
- **P&L tracking** — TRADER tracks entry price, shows live unrealized P&L with stop-loss/take-profit
- **Real-time transaction feed** — live subscription, deduped, newest first, no page scroll
- **Volume analytics** — charts derived only from real agent actions
- **Faucet integration** — links directly to `https://faucet.solana.com/` to get devnet SOL

---

## Setup & Running

1. **Open the app** at your Base44 app URL
2. **Create a username** (alphanumeric, 3–20 chars) — your session is isolated
3. **Three agents are auto-deployed** (ALPHA/TRADER, BETA/LIQUIDITY, GAMMA/MONITOR) with fresh devnet wallets
4. **Fund wallets** — click the Faucet button on any agent card, paste the wallet address at `https://faucet.solana.com/`
5. **Start agents** — press the green **Start** button. Agents begin executing every 15 seconds
6. **Monitor** — watch the live feed, transaction history, and volume analytics update in real time
7. **Stop agents** — press the red **Stop** button. No further transactions are recorded until restarted

---

## Security Model

| Concern | Approach |
|---------|----------|
| Key storage | XOR-encrypted with fixed devnet passphrase + stored in Base44 DB |
| Signing | Client-side, no key ever leaves the browser |
| Network | Solana **Devnet only** — no real funds at risk |
| Production use | ❌ NOT suitable — use HSM or TEE-backed solutions for mainnet |
| Isolation | Each username's agents and transactions are stored separately |

---

## SKILLS.md (Agent Reference)

The `/Skills` page in the app contains the full agent skills documentation including:
- Decision logic for all 3 archetypes
- Wallet security model
- RPC interaction patterns
- Stop-loss and take-profit trigger conditions
- How to extend agent behavior

---

## Tech Stack

- **React** + Tailwind CSS (Base44 platform)
- **@solana/web3.js** — wallet generation, signing, RPC calls
- **Base44 DB** — persistent Agent and Transaction entities
- **recharts** — analytics charts
- **JetBrains Mono** — monospaced terminal aesthetic
- **Solana Devnet** — test network, no real value

---

## Requirements Met

| Requirement | Status |
|------------|--------|
| Programmatic wallet creation | ✅ |
| Automatic transaction signing | ✅ |
| Holds SOL (devnet) | ✅ |
| Interacts with test protocol (peer-to-peer SOL transfers on devnet) | ✅ |
| Multiple independent agents each with own wallet | ✅ |
| Safe key management for autonomous agents | ✅ (XOR-encrypted, DB-persisted) |
| Automated signing without manual input | ✅ |
| AI agent decision simulation | ✅ (TRADER/LIQUIDITY/MONITOR archetypes) |
| Clear separation of agent logic vs wallet operations | ✅ (`agentEngine.js` vs `solanaEngine.js`) |
| Working prototype on devnet | ✅ |
| SKILLS.md for agents to read | ✅ |
| Open-source code with README | ✅ |
