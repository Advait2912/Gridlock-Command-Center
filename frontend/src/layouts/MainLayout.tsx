import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

// Inline SVG icons (Feather/Lucide style, no dependency)
const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);
const IconRadio = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 7.76a6 6 0 0 0 0 8.49"/>
    <path d="M20.07 4.93a10 10 0 0 1 0 14.14M3.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4M12 8h.01"/>
  </svg>
);

const navItems = [
  { to: '/', label: 'Historical Events', icon: <IconHistory />, end: true },
  { to: '/new', label: 'New Advisory', icon: <IconPlus />, end: false },
  { to: '/live', label: 'Live Situation Room', icon: <IconRadio />, end: false },
  { to: '/outcomes', label: 'Outcomes Log', icon: <IconClipboard />, end: false },
  { to: '/about', label: 'About', icon: <IconInfo />, end: false },
];

export const MainLayout: React.FC = () => {
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '220px', flexShrink: 0, background: 'var(--bg-secondary)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: 'var(--space-5) var(--space-4)', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '-0.01em' }}>GridLock</div>
          <div className="eyebrow" style={{ marginTop: '2px' }}>Command Center</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: 'var(--space-4) var(--space-3)', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
                background: isActive ? 'var(--accent-blue-glow)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              })}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer: live clock + system status */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--glass-border)' }}>
          <div className="metric metric-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
            {clock} IST
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '11px', color: 'var(--status-success)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-success)', display: 'inline-block' }} />
            System Operational
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 'var(--space-6)', height: '100vh', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};
