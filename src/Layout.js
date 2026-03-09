import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Username from './pages/Username';

export default function Layout({ children, currentPageName }) {
  const [username, setUsername] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('agentic_username');
    setUsername(stored || null);
    setChecking(false);
  }, []);

  const handleSessionCreated = (name) => {
    setUsername(name);
  };

  const handleSwitchUser = () => {
    localStorage.removeItem('agentic_username');
    setUsername(null);
  };

  if (checking) {
    return (
      <div style={{
        background: '#05050a', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(0,255,135,0.2)', borderTop: '2px solid #00ff87', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
}

if (!username) {
    return (
      <div style={{ background: '#05050a', minHeight: '100vh' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          * { box-sizing: border-box; }
          body { font-family: 'JetBrains Mono', 'Courier New', monospace !important; }
        `}</style>
        <Username onSessionCreated={handleSessionCreated} />
      </div>
    );
  }

  const childWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { username });
    }
    return child;
  });

  return (
    <div style={{ background: '#05050a', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { font-family: 'JetBrains Mono', 'Courier New', monospace !important; }
        a { text-decoration: none; }
        *, *::before, *::after {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
      <NavBar currentPage={currentPageName} onSwitchUser={handleSwitchUser} />
      <main>{childWithProps}</main>
    </div>
  );
    }
