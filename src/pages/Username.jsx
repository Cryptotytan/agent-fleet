import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

export default function Username({ onSessionCreated }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const validate = (v) => {
    if (v.length < 3) return 'Username must be at least 3 characters';
    if (v.length > 20) return 'Username must be 20 characters or less';
    if (!/^[a-zA-Z0-9]+$/.test(v)) return 'Alphanumeric only — no spaces or symbols';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate(username.trim());
    if (err) { setError(err); return; }
    localStorage.setItem('agentic_username', username.trim().toLowerCase());
    onSessionCreated(username.trim().toLowerCase());
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#05050a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(15,15,25,0.98)',
        border: '1px solid rgba(0,255,135,0.2)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 0 60px rgba(0,255,135,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#00ff87,#00d4ff)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} color="#05050a" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 22, letterSpacing: '0.15em', color: '#f1f5f9' }}>AGENTIC</span>
        </div>

        <h2 style={{ textAlign: 'center', color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>Create Your Session</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginBottom: 28, marginTop: 0 }}>
          Your agents and wallets are stored under your username.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 8, letterSpacing: 1 }}>USERNAME</label>
            <input
              autoFocus
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="e.g. trader42"
              maxLength={20}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 10, padding: '12px 16px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
                color: '#f1f5f9', outline: 'none',
              }}
            />
            {error && <p style={{ color: '#f87171', fontSize: 11, marginTop: 6, marginBottom: 0 }}>{error}</p>}
            <p style={{ color: '#475569', fontSize: 10, marginTop: 6, marginBottom: 0 }}>Alphanumeric · 3–20 chars · no spaces</p>
          </div>

          <button type="submit" style={{
            padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #00ff87, #00d4ff)',
            color: '#05050a', fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14, fontWeight: 800, letterSpacing: 1,
            boxShadow: '0 0 24px rgba(0,255,135,0.3)',
          }}>
            CREATE SESSION →
          </button>
        </form>
      </div>
    </div>
  );
                  }
