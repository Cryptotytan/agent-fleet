import React, { useState } from 'react';
import { Copy, ExternalLink, Play, Pause, Droplets, Check, Trash2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { truncateAddress, explorerAddressUrl, explorerUrl } from './solanaEngine';

const TYPE_CONFIG = {
  TRADER:    { color: '#00ff87', border: 'rgba(0,255,135,0.4)',   bg: 'rgba(0,255,135,0.07)',   glow: 'rgba(0,255,135,0.18)'  },
  LIQUIDITY: { color: '#00d4ff', border: 'rgba(0,212,255,0.4)',   bg: 'rgba(0,212,255,0.07)',   glow: 'rgba(0,212,255,0.18)'  },
  MONITOR:   { color: '#c084fc', border: 'rgba(192,132,252,0.4)', bg: 'rgba(192,132,252,0.07)', glow: 'rgba(192,132,252,0.18)'},
};

const FAUCET_URL = 'https://faucet.solana.com/';

export default function AgentCard({ agent, balance, balanceHistory, entryPrice, onStart, onPause, onAirdrop, onDelete }) {
  const [copied, setCopied] = useState(false);
  const cfg = TYPE_CONFIG[agent.type] || TYPE_CONFIG.TRADER;
  const isRunning = agent.status === 'RUNNING';
  const isPaused  = agent.status === 'PAUSED';
  const statusColor = isRunning ? '#00ff87' : isPaused ? '#fbbf24' : '#94a3b8';
  const chartData = (balanceHistory || []).map((v, i) => ({ i, v }));

  const copyAddr = () => {
    navigator.clipboard.writeText(agent.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMockCurrentPrice = () => {
    const match = agent.lastDecision?.match(/Price at ([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  };

  const currentPrice = getMockCurrentPrice();
  const pnlPercent = (agent.type === 'TRADER' && entryPrice && currentPrice)
    ? (((currentPrice - entryPrice) / entryPrice) * 100).toFixed(1)
    : null;

  return (
    <div className="fade-in flex flex-col gap-4" style={{
      background: 'rgba(15,15,25,0.97)',
      border: `1px solid ${isRunning ? cfg.border : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 16, padding: '20px',
      boxShadow: isRunning ? `0 0 40px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 18, color: '#f1f5f9', letterSpacing: 1 }}>{agent.name}</span>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 8px', borderRadius: 6, letterSpacing: 1 }}>{agent.type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: isRunning ? `0 0 10px ${statusColor}` : 'none' }} />
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: statusColor, fontWeight: 600 }}>{agent.status}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '8px 14px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: cfg.color, lineHeight: 1 }}>
            {typeof balance === 'number' ? balance.toFixed(4) : '—'}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>SOL</div>
        </div>
      </div>

      <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '8px 12px' }}>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {truncateAddress(agent.publicKey, 8)}
        </span>
        <button onClick={copyAddr} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b', display: 'flex' }}>
          {copied ? <Check size={13} color="#00ff87" /> : <Copy size={13} />}
        </button>
        <a href__={explorerAddressUrl(agent.publicKey)} target="_blank" rel="noreferrer" style={{ color: '#64748b', lineHeight: 0 }}>
          <ExternalLink size={13} />
        </a>
      </div>

      {chartData.length > 1 ? (
        <div style={{ height: 56, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '4px 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="v" stroke={cfg.color} strokeWidth={2} dot={false} />
              <Tooltip
                contentStyle={{ background: '#0f0f1a', border: `1px solid ${cfg.border}`, borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#f1f5f9' }}
                labelFormatter={() => 'Balance'}
                formatter={(v) => [`${v?.toFixed(4)} SOL`, '']}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height: 56, background: 'rgba(0,0,0,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>balance history will appear here</span>
        </div>
      )}

      {agent.type === 'TRADER' && (
        <div style={{ display: 'flex', gap: 8 }}>
          {entryPrice ? (
            <>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#64748b', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '4px 9px' }}>
                Entry: <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{entryPrice}</span>
              </span>
              {pnlPercent !== null && (
                <span style={{
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  background: parseFloat(pnlPercent) >= 0 ? 'rgba(0,255,135,0.1)' : 'rgba(248,113,113,0.1)',
                  border: `1px solid ${parseFloat(pnlPercent) >= 0 ? 'rgba(0,255,135,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  color: parseFloat(pnlPercent) >= 0 ? '#00ff87' : '#f87171',
                  borderRadius: 6, padding: '4px 9px',
                }}>
                  P&L: {parseFloat(pnlPercent) >= 0 ? '+' : ''}{pnlPercent}%
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#475569', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '4px 9px' }}>
              No open position
            </span>
          )}
        </div>
      )}

      <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px', minHeight: 54 }}>
        <div style={{ fontSize: 9, color: '#475569', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 5 }}>LAST DECISION</div>
        <div style={{ fontSize: 12, color: '#cbd5e1', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}>
          {agent.lastDecision || <span style={{ color: '#475569' }}>Awaiting first cycle...</span>}
        </div>
      </div>

      {agent.lastTxSig && (
        <a href__={explorerUrl(agent.lastTxSig)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 no-underline"
          style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#38bdf8' }}>
          <ExternalLink size={11} />
          Last tx: {truncateAddress(agent.lastTxSig, 8)}
        </a>
      )}

      <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {!isRunning ? (
          <button onClick={() => onStart(agent)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#00ff96', border: 'none', color: '#0a0a0f', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            <Play size={12} fill="#0a0a0f" />Start
          </button>
        ) : (
          <button onClick={() => onPause(agent)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#ff6b35', border: 'none', color: '#fff', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            <Pause size={12} fill="#fff" />Stop
          </button>
        )}
        <a href__={FAUCET_URL} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#00cfff', border: 'none', color: '#0a0a0f', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            <Droplets size={12} />Faucet
          </button>
        </a>
        <a href__={explorerAddressUrl(agent.publicKey)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.35)', color: '#c084fc', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <ExternalLink size={12} />Explorer
          </button>
        </a>
        <button onClick={() => onDelete(agent)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'rgba(255,69,69,0.12)', border: '1px solid rgba(255,69,69,0.35)', color: '#ff4545', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
      }
