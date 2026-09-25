import React from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Shield, Sparkles, LogOut, UserCheck, AlertTriangle } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout, quickLogin } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>
              Campus<span style={{ color: '#818cf8' }}>Desk</span>
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
              SLA & TICKET PLATFORM
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#818cf8" /> Demo Switcher:
          </span>
          <select
            className="glass-select"
            style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
            value={user?.email || ''}
            onChange={(e) => quickLogin(e.target.value)}
          >
            {DEMO_ACCOUNTS.map((acc) => (
              <option key={acc.email} value={acc.email}>
                [{acc.badge}] {acc.label}
              </option>
            ))}
          </select>
        </div>

        {/* User Card */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user.role === 'ADMIN' ? '#ec4899' : user.role === 'MANAGEMENT' ? '#8b5cf6' : user.role === 'STAFF' ? '#06b6d4' : '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#fff',
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user.role} • {user.department || user.program || 'Student'}
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 8px', borderRadius: '50%' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
