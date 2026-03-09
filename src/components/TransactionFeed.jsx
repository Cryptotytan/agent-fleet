import React from 'react';
import { ExternalLink } from 'lucide-react';
import { truncateAddress, explorerUrl } from './solanaEngine';

const TYPE_COLOR   = { TRADER: '#00ff87', LIQUIDITY: '#00d4ff', MONITOR: '#c084fc' };
const ACTION_COLOR = { BUY: '#00ff87', SELL: '#fb923c', REBALANCE: '#00d4ff', ALERT: '#fbbf24', HOLD: '#64748b', WATCHING: '#64748b', AIRDROP: '#34d399', PAUSED: '#c084fc', STARTED: '#00ff87' };
const STATUS_STYLE = {
  confirmed: { color: '#00ff87', bg: 'rgba(0,255,135,0.1)',   border: 'rgba(0,255,135,0.25)' },
  failed:    { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
};

export default function TransactionFeed({ transactions, maxVisible = 80, newestFirst = false }) {
  const visible = newestFirst
    ? [...transactions].reverse().slice(0, maxVisible)
    : [...transactions].slice(-maxVisible);

  if (visible.length === 0) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#475569' }}>
        No activity yet — start an agent to see transactions here
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {visible.map((tx, i) => {
        const ss = STATUS_STYLE[tx.status] || STATUS_STYLE.pending;
        const actionColor = ACTION_COLOR[tx.action] || '#94a3b8';
        const typeColor   = TYPE_COLOR[tx.agentType] || '#94a3b8';
        return (
          <div key={tx.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: '#475569', minWidth: 72, flexShrink: 0, fontSize: 11 }}>{tx.created_date ? new Date(tx.created_date).toLocaleTimeString() : '--:--:--'}</span>
            <span style={{ color: typeColor, fontWeight: 700, minWidth: 60, flexShrink: 0 }}>{tx.agentName || '—'}</span>
            <span style={{ color: actionColor, background: `${actionColor}15`, border: `1px solid ${actionColor}35`, fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 5, flexShrink: 0, letterSpacing: 0.5 }}>{tx.action}</span>
            {tx.amount > 0 && <span style={{ color: '#e2e8f0', fontWeight: 600, flexShrink: 0 }}>{tx.amount.toFixed(4)} SOL</span>}
            <span style={{ color: '#94a3b8', flex: 1, minWidth: 120 }}>{tx.reason}</span>
            {tx.signature && (
              <a href__={explorerUrl(tx.signature)} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', flexShrink: 0 }}>
                <ExternalLink size={10} />{truncateAddress(tx.signature, 5)}
              </a>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 5, flexShrink: 0, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}>{tx.status}</span>
          </div>
        );
      })}
    </div>
  );
}
