import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  PlusCircle,
  BarChart3,
  Users,
  AlertOctagon,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  FolderLock,
  Layers,
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, onOpenCreateModal, onExportExcel }) => {
  const { user, isStudent, isStaff, isAdmin, isManagement } = useAuth();

  const navItem = (id, label, icon, badgeCount = null) => {
    const active = currentView === id;
    return (
      <button
        key={id}
        onClick={() => setCurrentView(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '11px 14px',
          borderRadius: '12px',
          background: active ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
          color: active ? '#fff' : 'var(--text-muted)',
          border: active ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-heading)',
          fontWeight: active ? 600 : 500,
          fontSize: '0.88rem',
          transition: 'all 0.2s ease',
          marginBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {React.cloneElement(icon, { size: 18, color: active ? '#818cf8' : '#94a3b8' })}
          <span>{label}</span>
        </div>
        {badgeCount !== null && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 7px',
              borderRadius: '999px',
              background: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
            }}
          >
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: 'var(--text-sub)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '0 8px 10px',
          }}
        >
          {user?.role} PORTAL
        </div>

        {/* Primary Action Button */}
        {isStudent && (
          <button
            onClick={onOpenCreateModal}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px', padding: '12px' }}
          >
            <PlusCircle size={18} />
            Raise New Ticket
          </button>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        {/* Student Nav */}
        {isStudent && (
          <>
            {navItem('my-tickets', 'My Active Tickets', <Ticket />)}
            {navItem('pending-action', 'Action Required', <Clock />)}
            {navItem('resolved-history', 'Resolution History', <CheckCircle2 />)}
          </>
        )}

        {/* Staff Nav */}
        {isStaff && (
          <>
            {navItem('all-tickets', 'Ticket Queue', <Layers />)}
            {navItem('assigned-me', 'Assigned to Me', <Ticket />)}
            {navItem('pending-action', 'Pending Student Info', <Clock />)}
            {navItem('escalated', 'Escalated Issues', <AlertOctagon />)}
            {navItem('analytics', 'Queue Analytics', <BarChart3 />)}
          </>
        )}

        {/* Admin Nav */}
        {isAdmin && (
          <>
            {navItem('all-tickets', 'Enterprise Tickets', <Layers />)}
            {navItem('users', 'User & Access Directory', <Users />)}
            {navItem('escalated', 'Escalations & Breaches', <AlertOctagon />)}
            {navItem('analytics', 'Executive Analytics', <BarChart3 />)}
          </>
        )}

        {/* Management Nav */}
        {isManagement && (
          <>
            {navItem('analytics', 'Executive Visibility', <BarChart3 />)}
            {navItem('all-tickets', 'All Department Tickets', <Layers />)}
            {navItem('escalated', 'Escalated & SLA Breaches', <AlertOctagon />)}
          </>
        )}
      </nav>

      {/* Excel Download & Footer */}
      {(isAdmin || isManagement) && (
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={onExportExcel}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
          >
            <FileSpreadsheet size={16} color="#10b981" />
            Download Excel Records
          </button>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', textAlign: 'center', marginTop: '8px' }}>
            20 Students • 5 Admins (.xlsx)
          </div>
        </div>
      )}
    </aside>
  );
};
