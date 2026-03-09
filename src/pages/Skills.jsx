import React from 'react';
import SkillsPanel from '../components/SkillsPanel';
import { BookOpen } from 'lucide-react';

export default function Skills() {
  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: 36, height: 36, background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={16} color="#00ff87" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 22, color: '#e8eaf0', margin: 0 }}>SKILLS.md</h1>
            <p style={{ fontSize: 12, color: '#5a6380', fontFamily: 'JetBrains Mono', margin: '4px 0 0' }}>Agent capabilities & API documentation</p>
          </div>
        </div>
        <div className="glow-card p-6">
          <SkillsPanel />
        </div>
      </div>
    </div>
  );
}
