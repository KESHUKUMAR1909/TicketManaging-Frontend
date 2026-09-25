import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CreateUserModal } from './CreateUserModal';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  FileSpreadsheet,
  Shield,
  RefreshCw,
} from 'lucide-react';

export const UserManagementView = ({ onExportExcel }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        search,
        role: roleFilter,
        status: statusFilter,
        limit: 100,
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleAccess = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    const confirmMsg =
      newStatus === 'REVOKED'
        ? `Are you sure you want to REVOKE access for ${user.name}? They will immediately be locked out of logging in.`
        : `Grant and reactivate access for ${user.name}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(user._id);
    try {
      await api.patch(`/users/${user._id}/access`, { status: newStatus });
      await fetchUsers();
    } catch (err) {
      alert(`Access toggle error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const revokedCount = users.filter((u) => u.status === 'REVOKED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="#818cf8" />
            Institutional User & Access Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Admin tool to grant/revoke portal access, provision students, staff, and export official institution records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onExportExcel} className="btn btn-secondary">
            <FileSpreadsheet size={16} color="#10b981" />
            Export Excel (.xlsx)
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} />
            Create User
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 180px auto',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--text-sub)"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="glass-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search by name, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="glass-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student Only</option>
            <option value="STAFF">Staff Only</option>
            <option value="ADMIN">Admin Only</option>
            <option value="MANAGEMENT">Management Only</option>
          </select>

          <select
            className="glass-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Access Only</option>
            <option value="REVOKED">Revoked Access Only</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Stats Quick Badges */}
      <div style={{ display: 'flex', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={16} color="#818cf8" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Listed:</span>
          <strong style={{ color: '#fff' }}>{users.length}</strong>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCheck size={16} color="#34d399" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Accounts:</span>
          <strong style={{ color: '#34d399' }}>{activeCount}</strong>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserX size={16} color="#f87171" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Revoked Accounts:</span>
          <strong style={{ color: '#f87171' }}>{revokedCount}</strong>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw className="spin" size={24} style={{ margin: '0 auto 10px' }} />
            Loading accounts...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '14px 20px', color: 'var(--text-sub)' }}>User</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-sub)' }}>Role</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-sub)' }}>Roll / Program / Dept</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-sub)' }}>Access Status</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-sub)', textAlign: 'right' }}>Access Control</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isRevoked = u.status === 'REVOKED';
                  return (
                    <tr
                      key={u._id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isRevoked ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background:
                              u.role === 'ADMIN'
                                ? 'rgba(236, 72, 153, 0.15)'
                                : u.role === 'MANAGEMENT'
                                ? 'rgba(168, 85, 247, 0.15)'
                                : u.role === 'STAFF'
                                ? 'rgba(6, 182, 212, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              u.role === 'ADMIN'
                                ? '#f472b6'
                                : u.role === 'MANAGEMENT'
                                ? '#c084fc'
                                : u.role === 'STAFF'
                                ? '#38bdf8'
                                : '#34d399',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {u.role === 'STUDENT' ? (
                          <div>
                            <span style={{ color: '#fff' }}>{u.rollNumber || 'N/A'}</span> • {u.program || 'Undergrad'}
                          </div>
                        ) : (
                          <div>{u.department}</div>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '999px',
                            background: isRevoked ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                            color: isRevoked ? '#f87171' : '#34d399',
                            border: isRevoked ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {isRevoked ? <UserX size={12} /> : <UserCheck size={12} />}
                          {u.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleAccess(u)}
                          disabled={actionLoadingId === u._id}
                          className={isRevoked ? 'btn btn-success btn-sm' : 'btn btn-danger btn-sm'}
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                        >
                          {actionLoadingId === u._id
                            ? 'Updating...'
                            : isRevoked
                            ? 'Grant Access'
                            : 'Revoke Access'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};
