import React, { useState } from 'react';
import { X } from 'lucide-react';

const TYPES = ['TRADER', 'LIQUIDITY', 'MONITOR'];

export default function AddAgentModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('TRADER');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await onAdd({ name: name.trim(), type });
    setCreating(false);
    onClose();
  };

  const typeColor = { TRADER: '#00ff87', LIQUIDITY: '#00d4ff', MONITOR: '#c084fc' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{
        background: '#111120', border: '1px solid rgba(0,255,135,0.3)',
        borderRadius: 16, padding: 28, width: '100%', maxWidth: 420,
        boxShadow: '0 0 40px rgba(0,255,135,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 17, color: '#f1f5f9', margin: 0 }}>Deploy New Agent</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer', color: '#cbd5e1', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#94a3b8', display: 'block', marginBottom: 8, letterSpacing: 1 }}>AGENT NAME</label>
            <input
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              placeholder="e.g. ALPHA-7"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={32}
              required
              onFocus={e => e.target.style.borderColor = 'rgba(0,255,135,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#94a3b8', display: 'block', marginBottom: 8, letterSpacing: 1 }}>AGENT TYPE</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TYPES.map(t => {
                const active = type === t;
                const color = typeColor[t];
                return (
                  <button key={t} type="button" onClick={() => setType(t)} style={{
                    flex: 1, padding: '11px 0', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                    background: active ? color : 'rgba(255,255,255,0.06)',
                    border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.15)',
                    color: active ? '#0a0a0f' : '#94a3b8',
                    transition: 'all 0.15s',
                  }}>{t}</button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.2)', fontSize: 12, fontFamily: 'JetBrains Mono', color: '#86efac', lineHeight: 1.7 }}>
            This will generate a new Solana keypair and request a 1 SOL devnet airdrop automatically.
          </div>

          <button type="submit" disabled={creating} style={{
            padding: '13px', borderRadius: 10, border: 'none',
            background: creating ? 'rgba(0,255,135,0.3)' : '#00ff87',
            color: '#0a0a0f', fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 800,
            cursor: creating ? 'not-allowed' : 'pointer', width: '100%', transition: 'opacity 0.2s',
          }}>
            {creating ? 'Deploying...' : 'Deploy Agent'}
          </button>
        </form>
      </div>
    </div>
  );
      }
