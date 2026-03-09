import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, AlertTriangle, RefreshCw, Cpu, Trash2 } from 'lucide-react';
import AgentCard from '../components/AgentCard';
import AddAgentModal from '../components/AddAgentModal';
import TransactionFeed from '../components/TransactionFeed';
import { createWallet, getBalance, airdropSOL, sendSOL } from '../components/solanaEngine';
import { traderDecide, liquidityDecide, monitorDecide, getMockPrice } from '../components/agentEngine';

const LS_KEY = (username) => `agentic_data_${username}`;

function loadUserData(username) {
  try { return JSON.parse(localStorage.getItem(LS_KEY(username))) || {}; } catch { return {}; }
}
function saveUserData(username, data) {
  localStorage.setItem(LS_KEY(username), JSON.stringify(data));
}

export default function Agents({ username }) {
  const [agents, setAgents] = useState([]);
  const [balances, setBalances] = useState({});
  const [balanceHistory, setBalanceHistory] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [entryPrices, setEntryPrices] = useState({});
  const intervalsRef = useRef({});
  const seenTxSigsRef = useRef(new Set());

  useEffect(() => {
    initAgents();
    loadTransactions();

    const unsub = base44.entities.Transaction.subscribe((event) => {
      if (event.type === 'create') {
        const tx = event.data;
        const key = tx.signature || tx.id;
        if (key && seenTxSigsRef.current.has(key)) return;
        if (key) seenTxSigsRef.current.add(key);
        setTransactions(prev => [...prev, tx].slice(-300));
      }
    });
    return unsub;
  }, [username]); // eslint-disable-line

  useEffect(() => {
    if (initializing || agents.length === 0) return;
    agents.forEach(agent => {
      if (agent.status === 'RUNNING' && !intervalsRef.current[agent.id]) {
        attachInterval(agent);
      }
    });
  }, [initializing]); // eslint-disable-line

const refreshBalances = useCallback(async () => {
    const list = await base44.entities.Agent.list('-created_date', 50);
    const myAgents = list.filter(a => a.username === username);
    setAgents(myAgents);
    const newBals = {};
    for (const agent of myAgents) {
      const bal = await getBalance(agent.publicKey);
      newBals[agent.id] = bal;
      setBalanceHistory(prev => ({
        ...prev,
        [agent.id]: [...(prev[agent.id] || []), bal].slice(-20),
      }));
    }
    setBalances(newBals);
  }, [username]);

  useEffect(() => {
    if (agents.length === 0) return;
    refreshBalances();
    const t = setInterval(refreshBalances, 12000);
    return () => clearInterval(t);
  }, [agents.length]); // eslint-disable-line

  const initAgents = async (retries = 3) => {
    setInitializing(true);

    const stored = loadUserData(username);
    if (stored.entryPrices) setEntryPrices(stored.entryPrices);

    let existing;
    for (let i = 0; i < retries; i++) {
      try {
        existing = await base44.entities.Agent.list('-created_date', 50);
        break;
      } catch (e) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        } else {
          setInitializing(false);
          return;
        }
      }
    }
    const myAgents = existing.filter(a => a.username === username);

    if (myAgents.length === 0) {
      const defs = [
        { name: 'ALPHA', type: 'TRADER' },
        { name: 'BETA',  type: 'LIQUIDITY' },
        { name: 'GAMMA', type: 'MONITOR' },
      ];
      const created = [];
      for (const def of defs) {
        const wallet = createWallet();
        const agent = await base44.entities.Agent.create({
          name: def.name, type: def.type,
          publicKey: wallet.publicKey, encryptedSecret: wallet.encryptedSecret,
          status: 'IDLE', lastDecision: '', lastTxSig: '', balanceHistory: [],
          username,
        });
        created.push(agent);
        try { await airdropSOL(wallet.publicKey, 1); } catch { /* rate limited */ }
      }
      setAgents(created);
    } else {
      setAgents(myAgents);
    }
    setInitializing(false);
  };

  const loadTransactions = async () => {
    const txs = await base44.entities.Transaction.list('-created_date', 300);
    const myTxs = txs.filter(t => t.username === username).reverse();
    myTxs.forEach(tx => {
      const key = tx.signature || tx.id;
      if (key) seenTxSigsRef.current.add(key);
    });
    setTransactions(myTxs);
  };

  const logTransaction = async (agentId, agentName, agentType, action, reason, sig = '', amount = 0, status = 'confirmed', toAddress = '', fromAddress = '') => {
    if (sig && seenTxSigsRef.current.has(sig)) return null;
    const tx = await base44.entities.Transaction.create({
      agentId, agentName, agentType, action, reason,
      signature: sig, amount, status, toAddress, fromAddress,
      balanceAfter: balances[agentId] || 0,
      username,
    });
    const key = sig || tx.id;
    if (key) seenTxSigsRef.current.add(key);
    setTransactions(prev => [...prev, tx].slice(-300));
    return tx;
  };

  const updateEntryPrice = (agentId, price) => {
    setEntryPrices(prev => {
      const next = { ...prev, [agentId]: price };
      const stored = loadUserData(username);
      saveUserData(username, { ...stored, entryPrices: next });
      return next;
    });
  };

const runTrader = async (agent) => {
    const bal = await getBalance(agent.publicKey);
    const price = getMockPrice();
    const currentEntry = entryPrices[agent.id] ?? null;
    const decision = traderDecide(bal, price, currentEntry);
    if (!decision) return;

    await base44.entities.Agent.update(agent.id, { lastDecision: decision.reason, lastActionTime: new Date().toISOString() });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, lastDecision: decision.reason } : a));

    if ((decision.action === 'BUY' || decision.action === 'SELL') && decision.amount > 0) {
      const allAgents = await base44.entities.Agent.list('-created_date', 50);
      const peers = allAgents.filter(a => a.id !== agent.id && a.username === username);
      if (peers.length === 0) return;
      const peer = peers[Math.floor(Math.random() * peers.length)];
      try {
        const sig = await sendSOL({ publicKey: agent.publicKey, encryptedSecret: agent.encryptedSecret }, peer.publicKey, decision.amount);
        await base44.entities.Agent.update(agent.id, { lastTxSig: sig });
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, lastTxSig: sig } : a));
        await logTransaction(agent.id, agent.name, agent.type, decision.action, decision.reason, sig, decision.amount, 'confirmed', peer.publicKey, agent.publicKey);
        if (decision.newEntryPrice !== undefined) updateEntryPrice(agent.id, decision.newEntryPrice);
      } catch {
        await logTransaction(agent.id, agent.name, agent.type, decision.action, decision.reason + ' [FAILED]', '', decision.amount, 'failed', '', agent.publicKey);
      }
    } else {
      await logTransaction(agent.id, agent.name, agent.type, decision.action, decision.reason);
      if (decision.newEntryPrice !== undefined) updateEntryPrice(agent.id, decision.newEntryPrice);
    }
  };

  const runLiquidity = async (agent) => {
    const bal = await getBalance(agent.publicKey);
    const allAgents = await base44.entities.Agent.list('-created_date', 50);
    const peers = allAgents.filter(a => a.id !== agent.id && a.username === username).slice(0, 2);
    const decision = liquidityDecide(bal, peers.length);
    if (!decision || peers.length === 0) return;

    await base44.entities.Agent.update(agent.id, { lastDecision: decision.reason, lastActionTime: new Date().toISOString() });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, lastDecision: decision.reason } : a));

    for (const peer of peers) {
      try {
        const sig = await sendSOL({ publicKey: agent.publicKey, encryptedSecret: agent.encryptedSecret }, peer.publicKey, decision.amount);
        await base44.entities.Agent.update(agent.id, { lastTxSig: sig });
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, lastTxSig: sig } : a));
        await logTransaction(agent.id, agent.name, agent.type, 'REBALANCE', `Sent ${decision.amount} SOL to ${peer.name}`, sig, decision.amount, 'confirmed', peer.publicKey, agent.publicKey);
      } catch {
        await logTransaction(agent.id, agent.name, agent.type, 'REBALANCE', `Transfer to ${peer.name} failed`, '', decision.amount, 'failed', '', agent.publicKey);
      }
    }
  };

  const runMonitor = async (agent) => {
    const allAgents = await base44.entities.Agent.list('-created_date', 50);
    const agentBalances = await Promise.all(
      allAgents.filter(a => a.id !== agent.id && a.username === username).map(async (a) => ({
        name: a.name, balance: await getBalance(a.publicKey),
      }))
    );
    const decision = monitorDecide(agentBalances);
    await base44.entities.Agent.update(agent.id, { lastDecision: decision.reason, lastActionTime: new Date().toISOString() });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, lastDecision: decision.reason } : a));
    await logTransaction(agent.id, agent.name, agent.type, decision.action, decision.reason);
  };

  const attachInterval = (agent) => {
    if (intervalsRef.current[agent.id]) return;

    const run = async () => {
      const fresh = await base44.entities.Agent.list('-created_date', 50);
      const current = fresh.find(a => a.id === agent.id);
      if (!current || current.status !== 'RUNNING') {
        clearInterval(intervalsRef.current[agent.id]);
        delete intervalsRef.current[agent.id];
        return;
      }
      if (current.type === 'TRADER')         await runTrader(current);
      else if (current.type === 'LIQUIDITY') await runLiquidity(current);
      else if (current.type === 'MONITOR')   await runMonitor(current);
    };

    run();
    intervalsRef.current[agent.id] = setInterval(run, 15000);
  };

  const startAgent = async (agent) => {
    await base44.entities.Agent.update(agent.id, { status: 'RUNNING' });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'RUNNING' } : a));
    await logTransaction(agent.id, agent.name, agent.type, 'STARTED', 'Agent activated by operator');
    attachInterval(agent);
  };

  const pauseAgent = async (agent) => {
    clearInterval(intervalsRef.current[agent.id]);
    delete intervalsRef.current[agent.id];
    await base44.entities.Agent.update(agent.id, { status: 'PAUSED' });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'PAUSED' } : a));
    await logTransaction(agent.id, agent.name, agent.type, 'PAUSED', 'Agent stopped by operator');
  };

  const confirmDelete = (agent) => setDeleteConfirm(agent);

  const deleteAgent = async () => {
    const agent = deleteConfirm;
    setDeleteConfirm(null);
    clearInterval(intervalsRef.current[agent.id]);
    delete intervalsRef.current[agent.id];
    await base44.entities.Agent.delete(agent.id);
    setAgents(prev => prev.filter(a => a.id !== agent.id));
  };

  const handleAirdrop = async (agent) => {
    try {
      const sig = await airdropSOL(agent.publicKey, 1);
      await logTransaction(agent.id, agent.name, agent.type, 'AIRDROP', 'Received 1 SOL from devnet faucet', sig, 1, 'confirmed', agent.publicKey);
      await refreshBalances();
    } catch {
      await logTransaction(agent.id, agent.name, agent.type, 'AIRDROP', 'Airdrop failed — use Faucet button to get SOL manually', '', 1, 'failed');
    }
  };

  const handleAddAgent = async ({ name, type }) => {
    const wallet = createWallet();
    const agent = await base44.entities.Agent.create({
      name, type, publicKey: wallet.publicKey, encryptedSecret: wallet.encryptedSecret,
      status: 'IDLE', lastDecision: '', lastTxSig: '', balanceHistory: [], username,
    });
    setAgents(prev => [...prev, agent]);
    try {
      await airdropSOL(wallet.publicKey, 1);
      await logTransaction(agent.id, name, type, 'AIRDROP', 'Initial 1 SOL airdrop on deploy', '', 1, 'confirmed', wallet.publicKey);
    } catch {
      await logTransaction(agent.id, name, type, 'AIRDROP', 'Initial airdrop rate limited', '', 1, 'failed');
    }
    await refreshBalances();
  };

  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#05050a' }}>
        <RefreshCw size={28} color="#00ff87" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00ff87', fontSize: 13 }}>Initializing agent wallets...</p>
      </div>
    );
}

  const runningCount = agents.filter(a => a.status === 'RUNNING').length;

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 16px',
          background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: 10,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#fb923c',
        }}>
          <AlertTriangle size={14} />
          DEVNET ONLY — Not for mainnet use. Wallets are persisted in the database and encrypted.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Cpu size={20} color="#00ff87" />
              <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 24, color: '#f1f5f9', margin: 0 }}>Agent Fleet</h1>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'JetBrains Mono', monospace", margin: '4px 0 0' }}>
              {agents.length} deployed · <span style={{ color: '#00ff87' }}>{runningCount} running</span>
              {username && <span style={{ color: '#475569' }}> · @{username}</span>}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={refreshBalances} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
              background: '#00ff96', border: 'none', borderRadius: 8,
              color: '#0a0a0f', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              <RefreshCw size={13} />Refresh
            </button>
            <button onClick={() => setShowAddModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
              background: '#00cfff', border: 'none', borderRadius: 8,
              color: '#0a0a0f', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              <Plus size={13} />Add Agent
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, marginBottom: 32 }}>
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              balance={balances[agent.id]}
              balanceHistory={balanceHistory[agent.id]}
              entryPrice={entryPrices[agent.id] ?? null}
              onStart={startAgent}
              onPause={pauseAgent}
              onAirdrop={handleAirdrop}
              onDelete={confirmDelete}
            />
          ))}
        </div>

        <div style={{
          background: 'rgba(15,15,25,0.95)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16, padding: '20px 20px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="pulse-green" style={{ width: 8, height: 8 }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: '#f1f5f9', letterSpacing: 1 }}>
                LIVE TRANSACTION FEED
              </span>
            </div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#475569' }}>{transactions.length} recorded</span>
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            <TransactionFeed transactions={transactions} newestFirst />
          </div>
        </div>

      </div>

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'rgba(20,10,10,0.98)', border: '1px solid rgba(255,69,69,0.35)', borderRadius: 16, padding: '32px 28px', maxWidth: 380, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Trash2 size={20} color="#ff4545" />
              <h3 style={{ color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, margin: 0 }}>Delete Agent</h3>
            </div>
            <p style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7, marginBottom: 24 }}>
              Are you sure you want to delete <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{deleteConfirm.name}</span>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: '11px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={deleteAgent} style={{
                flex: 1, padding: '11px', borderRadius: 8, border: 'none',
                background: '#ff4545', color: '#fff',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && <AddAgentModal onAdd={handleAddAgent} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
