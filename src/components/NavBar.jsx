import React, { useState, useEffect } from 'react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { Cpu, BarChart2, History, BookOpen, Menu, X, LogOut } from 'lucide-react';

const navLinks = [
  { name: 'Agents',       page: 'Agents',       icon: Cpu },
  { name: 'Volume',       page: 'Volume',        icon: BarChart2 },
  { name: 'Transactions', page: 'Transactions',  icon: History },
  { name: 'Skills',       page: 'Skills',        icon: BookOpen },
];

export default function NavBar({ currentPage, onSwitchUser }) {
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem('agentic_username');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('https://api.devnet.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
        });
        const data = await res.json();
        setConnected(data.result === 'ok');
      } catch { setConnected(false); }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav style={{ background: 'rgba(5,5,10,0.97)', borderBottom: '1px solid rgba(0,255,135,0.1)', backdropFilter: 'blur(20px)', fontFamily: "'JetBrains Mono', monospace" }}
      className="sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link to={createPageUrl('Agents')} className="flex items-center gap-2 no-underline">
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#00ff87,#00d4ff)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={14} color="#05050a" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 16, letterSpacing: '0.15em', color: '#f1f5f9' }}>AGENTIC</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ name, page, icon: NavIcon }) => {
            const active = currentPage === page;
            return (
              <Link key={page} to={createPageUrl(page)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg no-underline transition-all duration-200"
                style={{
                  background: active ? 'rgba(0,255,135,0.1)' : 'transparent',
                  color: active ? '#00ff87' : '#94a3b8',
                  fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                  border: active ? '1px solid rgba(0,255,135,0.25)' : '1px solid transparent',
                  fontWeight: active ? 700 : 400,
                }}>
                <NavIcon size={13} />{name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={connected ? 'pulse-green' : ''} style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#00ff87' : '#f87171' }} />
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: connected ? '#00ff87' : '#f87171' }}>
              {connected ? 'DEVNET' : 'OFFLINE'}
            </span>
          </div>

          {username && (
            <button onClick={onSwitchUser} title="Switch user" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, cursor: 'pointer', color: '#94a3b8',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            }}>
              <span style={{ color: '#f1f5f9', fontWeight: 700 }}>@{username}</span>
              <LogOut size={12} />
            </button>
          )}

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'rgba(5,5,10,0.99)', borderTop: '1px solid rgba(0,255,135,0.08)' }} className="md:hidden px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ name, page, icon: MobileIcon }) => {
            const active = currentPage === page;
            return (
              <Link key={page} to={createPageUrl(page)} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg no-underline"
                style={{ background: active ? 'rgba(0,255,135,0.08)' : 'transparent', color: active ? '#00ff87' : '#94a3b8', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: active ? 700 : 400 }}>
                <MobileIcon size={14} />{name}
              </Link>
            );
          })}
          {username && (
            <button onClick={onSwitchUser} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
              <LogOut size={14} />Switch User
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
