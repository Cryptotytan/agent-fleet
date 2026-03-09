import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw, TrendingUp, Zap, Activity, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TYPE_COLOR = { TRADER: '#00ff87', LIQUIDITY: '#00d4ff', MONITOR: '#c084fc' };
const ACTION_COLORS = ['#00ff87', '#00d4ff', '#fb923c', '#fbbf24', '#c084fc', '#f87171', '#34d399'];

const CHART_TOOLTIP_STYLE = {
  background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono', color: '#e2e8f0',
};

const REAL_ACTIONS = new Set(['BUY', 'SELL', 'REBALANCE', 'AIRDROP', 'ALERT', 'HOLD', 'WATCHING', 'MONITOR']);

export default function Volume({ username }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const unsub = base44.entities.Transaction.subscribe((event) => {
      if (event.type === 'create' && event.data.username === username) {
        setTransactions(prev => [event.data, ...prev]);
      }
    });
    return unsub;
  }, [username]);

  const load = async () => {
    setLoading(true);
    const txs = await base44.entities.Transaction.list('-created_date', 2000);
    setTransactions(txs.filter(t => t.username === username));
    setLoading(false);
  };

  const agentTxs = transactions.filter(t => t.agentType && t.action && REAL_ACTIONS.has(t.action));
  const totalVolume = agentTxs.filter(t => t.amount > 0).reduce((s, t) => s + (t.amount || 0), 0);
  const confirmed = agentTxs.filter(t => t.status === 'confirmed').length;
  const failed    = agentTxs.filter(t => t.status === 'failed').length;
  const totalTx   = agentTxs.length;

  const volByType = ['TRADER', 'LIQUIDITY', 'MONITOR'].map(type => ({
    name: type,
    volume: +(agentTxs.filter(t => t.agentType === type && t.amount > 0).reduce((s, t) => s + t.amount, 0).toFixed(4)),
    count: agentTxs.filter(t => t.agentType === type).length,
  }));

  const volByAction = {};
  agentTxs.forEach(t => {
    if (!volByAction[t.action]) volByAction[t.action] = { count: 0, volume: 0 };
    volByAction[t.action].count++;
    volByAction[t.action].volume += t.amount || 0;
  });
  const actionData = Object.entries(volByAction)
    .map(([action, v]) => ({ action, count: v.count, volume: +v.volume.toFixed(4) }))
    .sort((a, b) => b.count - a.count);

  const now = Date.now();
  const hourBuckets = {};
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now - i * 3600000);
    const key = d.toLocaleTimeString([], { hour: '2-digit' });
    hourBuckets[key] = { time: key, count: 0, volume: 0 };
  }
  agentTxs.forEach(tx => {
    if (!tx.created_date) return;
    const d = new Date(tx.created_date);
    if (now - d.getTime() < 86400000) {
      const key = d.toLocaleTimeString([], { hour: '2-digit' });
      if (hourBuckets[key]) { hourBuckets[key].count++; hourBuckets[key].volume += tx.amount || 0; }
    }
  });
  const timelineData = Object.values(hourBuckets);
  const pieData = volByType.filter(d => d.count > 0);

  const StatCard = ({ label, value, sub, icon: Icon, color }) => (
    <div style={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#64748b', letterSpacing: 1 }}>{label}</span>
        <div style={{ padding: 8, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30` }}><Icon size={15} color={color} /></div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: 6 }}>{sub}</div>}
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div style={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '20px' }}>
      <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 20, marginTop: 0, letterSpacing: 0.5 }}>{title}</h3>
      {children}
    </div>
  );
if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050a' }}>
      <RefreshCw size={24} color="#00ff87" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 size={20} color="#fbbf24" />
            <div>
              <h1 style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 24, color: '#f1f5f9', margin: 0 }}>Volume Analytics</h1>
              <p style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono', margin: '4px 0 0' }}>Real agent activity only · {totalTx} total agent transactions</p>
            </div>
          </div>
          <button className="btn-primary" onClick={load}><RefreshCw size={12} style={{ display: 'inline', marginRight: 6 }} />Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="TOTAL SOL VOLUME"     value={`${totalVolume.toFixed(3)}`} sub="SOL transferred by agents"       icon={TrendingUp} color="#00ff87" />
          <StatCard label="AGENT TRANSACTIONS"   value={totalTx}                     sub={`${confirmed} confirmed · ${failed} failed`} icon={Activity}   color="#00d4ff" />
          <StatCard label="SUCCESS RATE"         value={totalTx > 0 ? `${Math.round((confirmed/totalTx)*100)}%` : '—'} sub={`${failed} failed transactions`} icon={TrendingUp} color="#c084fc" />
          <StatCard label="ACTION TYPES"         value={actionData.length}           sub="distinct agent actions"          icon={Zap}        color="#fbbf24" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 16 }}>
          <ChartCard title="24H TRANSACTION TIMELINE">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ff87" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} interval={3} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="count" stroke="#00ff87" strokeWidth={2} fill="url(#cg1)" name="Transactions" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="VOLUME BY AGENT TYPE">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="volume" radius={[6,6,0,0]} name="SOL Volume">
                  {volByType.map(entry => <Cell key={entry.name} fill={TYPE_COLOR[entry.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <ChartCard title="ACTION BREAKDOWN">
            {actionData.length === 0 ? (
              <div style={{ color: '#475569', fontFamily: 'JetBrains Mono', fontSize: 12, padding: '20px 0' }}>No agent actions recorded yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {actionData.map(({ action, count, volume }, idx) => {
                  const color = ACTION_COLORS[idx % ACTION_COLORS.length];
                  return (
                    <div key={action} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color, background: `${color}15`, border: `1px solid ${color}35`, padding: '2px 8px', borderRadius: 5, fontFamily: 'JetBrains Mono', minWidth: 90, textAlign: 'center' }}>{action}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100,(count/(totalTx||1))*100)}%`, background: color, borderRadius: 3 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#94a3b8', minWidth: 40, textAlign: 'right' }}>{count}×</span>
                      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#e2e8f0', minWidth: 76, textAlign: 'right' }}>{volume > 0 ? `${volume.toFixed(3)} SOL` : '—'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>

          <ChartCard title="ACTIVITY DISTRIBUTION">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="count">
                    {pieData.map(entry => <Cell key={entry.name} fill={TYPE_COLOR[entry.name]} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend formatter={(v) => <span style={{ color: TYPE_COLOR[v] || '#94a3b8', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                Start agents to see activity distribution
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
