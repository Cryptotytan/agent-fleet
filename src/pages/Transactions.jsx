import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Search, RefreshCw, Activity } from 'lucide-react';
import { explorerUrl, truncateAddress } from '../components/solanaEngine';

const ACTION_COLOR = {
  BUY: '#00ff87', SELL: '#fb923c', REBALANCE: '#00d4ff', ALERT: '#fbbf24',
  HOLD: '#64748b', WATCHING: '#64748b', AIRDROP: '#34d399', PAUSED: '#c084fc',
  STARTED: '#00ff87', MONITOR: '#c084fc',
};
const TYPE_COLOR = { TRADER: '#00ff87', LIQUIDITY: '#00d4ff', MONITOR: '#c084fc' };

const badge = (color, text) => (
  <span style={{
    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 5,
    color, background: `${color}15`, border: `1px solid ${color}35`,
    fontFamily: 'JetBrains Mono', letterSpacing: 0.5, whiteSpace: 'nowrap',
  }}>{text}</span>
);

export default function Transactions({ username }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadAll();
    const unsub = base44.entities.Transaction.subscribe((event) => {
      if (event.type === 'create' && event.data.username === username) {
        setTransactions(prev => [event.data, ...prev]);
      }
    });
    return unsub;
  }, [username]);

  const loadAll = async () => {
    setLoading(true);
    const txs = await base44.entities.Transaction.list('-created_date', 1000);
    setTransactions(txs.filter(t => t.username === username));
    setLoading(false);
  };

  const uniqueActions = ['ALL', ...Array.from(new Set(transactions.map(t => t.action).filter(Boolean)))];
  const types = ['ALL', 'TRADER', 'LIQUIDITY', 'MONITOR'];
  const statuses = ['ALL', 'confirmed', 'failed', 'pending'];

  const filtered = transactions.filter(tx => {
    const matchSearch = !search ||
      tx.agentName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.reason?.toLowerCase().includes(search.toLowerCase()) ||
      tx.signature?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'ALL' || tx.action === filterAction;
    const matchType   = filterType   === 'ALL' || tx.agentType === filterType;
    const matchStatus = filterStatus === 'ALL' || tx.status === filterStatus;
    return matchSearch && matchAction && matchType && matchStatus;
  });

  const confirmed = transactions.filter(t => t.status === 'confirmed').length;

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={20} color="#00d4ff" />
            <div>
              <h1 style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 24, color: '#f1f5f9', margin: 0 }}>Transaction History</h1>
              <p style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono', margin: '4px 0 0' }}>
                {filtered.length} shown · {confirmed} confirmed total
              </p>
            </div>
          </div>
          <button className="btn-cyan" onClick={loadAll}>
            <RefreshCw size={12} style={{ display: 'inline', marginRight: 6 }} />Refresh
          </button>
        </div>

        <div style={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '8px 12px' }}>
            <Search size={14} color="#475569" />
            <input
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              placeholder="Search agent name, reason, signature..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono', alignSelf: 'center', marginRight: 4 }}>ACTION</span>
            {uniqueActions.slice(0, 8).map(a => (
              <button key={a} onClick={() => setFilterAction(a)} style={{
                padding: '4px 10px', borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 10, cursor: 'pointer',
                background: filterAction === a ? `${ACTION_COLOR[a] || '#00ff87'}20` : 'rgba(255,255,255,0.04)',
                border: filterAction === a ? `1px solid ${ACTION_COLOR[a] || '#00ff87'}55` : '1px solid rgba(255,255,255,0.08)',
                color: filterAction === a ? (ACTION_COLOR[a] || '#00ff87') : '#64748b', fontWeight: filterAction === a ? 700 : 400,
              }}>{a}</button>
            ))}
            <span style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono', alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>TYPE</span>
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                padding: '4px 10px', borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 10, cursor: 'pointer',
                background: filterType === t ? `${TYPE_COLOR[t] || '#94a3b8'}20` : 'rgba(255,255,255,0.04)',
                border: filterType === t ? `1px solid ${TYPE_COLOR[t] || '#94a3b8'}55` : '1px solid rgba(255,255,255,0.08)',
                color: filterType === t ? (TYPE_COLOR[t] || '#94a3b8') : '#64748b', fontWeight: filterType === t ? 700 : 400,
              }}>{t}</button>
            ))}
            <span style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono', alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>STATUS</span>
            {statuses.map(s => {
              const sc = s === 'confirmed' ? '#00ff87' : s === 'failed' ? '#f87171' : s === 'pending' ? '#fbbf24' : '#94a3b8';
              return (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '4px 10px', borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 10, cursor: 'pointer',
                  background: filterStatus === s ? `${sc}20` : 'rgba(255,255,255,0.04)',
                  border: filterStatus === s ? `1px solid ${sc}55` : '1px solid rgba(255,255,255,0.08)',
                  color: filterStatus === s ? sc : '#64748b', fontWeight: filterStatus === s ? 700 : 400,
                }}>{s.toUpperCase()}</button>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 56, textAlign: 'center', fontFamily: 'JetBrains Mono', color: '#475569', fontSize: 13 }}>
              <RefreshCw size={22} color="#00d4ff" style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: 10 }} /><br />Loading transactions...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
                    {['Time','Agent','Type','Action','Reason','Amount','Signature','Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap', letterSpacing: 1 }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '56px 16px', textAlign: 'center', color: '#475569', fontFamily: 'JetBrains Mono' }}>No transactions match your filters</td></tr>
                  ) : filtered.map((tx, i) => (
                    <tr key={tx.id || i}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', color: '#64748b', whiteSpace: 'nowrap', fontSize: 11 }}>{tx.created_date ? new Date(tx.created_date).toLocaleString() : '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#e2e8f0', fontWeight: 700, whiteSpace: 'nowrap' }}>{tx.agentName}</td>
                      <td style={{ padding: '10px 16px' }}>{badge(TYPE_COLOR[tx.agentType] || '#64748b', tx.agentType || '—')}</td>
                      <td style={{ padding: '10px 16px' }}>{badge(ACTION_COLOR[tx.action] || '#94a3b8', tx.action || '—')}</td>
                      <td style={{ padding: '10px 16px', color: '#94a3b8', maxWidth: 260 }}>
                        <span title={tx.reason} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.reason}</span>
                      </td>
                      <td style={{ padding: '10px 16px', color: tx.amount > 0 ? '#00ff87' : '#475569', whiteSpace: 'nowrap', fontWeight: tx.amount > 0 ? 700 : 400 }}>{tx.amount > 0 ? `${tx.amount.toFixed(4)} SOL` : '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        {tx.signature ? (
                          <a href__={explorerUrl(tx.signature)} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                            <ExternalLink size={11} />{truncateAddress(tx.signature, 6)}
                          </a>
                        ) : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 16px' }}>{badge(tx.status === 'confirmed' ? '#00ff87' : tx.status === 'failed' ? '#f87171' : '#fbbf24', (tx.status || 'pending').toUpperCase())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
      }
                        
