import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TicketCard } from './TicketCard';
import { TicketDetailModal } from './TicketDetailModal';
import {
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Inbox,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Fees',
  'Attendance',
  'ID Cards',
  'Documents',
  'Certificates',
  'Administrative',
  'Other',
];

const STATUSES = [
  'ALL',
  'OPEN',
  'IN_PROGRESS',
  'PENDING_STUDENT',
  'RESOLVED',
  'CLOSED',
  'ESCALATED',
];

export const TicketListView = ({
  title = 'Ticket Queue',
  subtitle = 'Manage, track, and resolve student support requests',
  defaultStatus = 'ALL',
  onlyEscalated = false,
  onlyPendingAction = false,
  onlyAssignedToMe = false,
  onOpenCreateModal,
}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState(defaultStatus);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search,
        category,
        priority,
      };

      if (onlyEscalated) {
        params.isEscalated = 'true';
      } else if (onlyPendingAction) {
        params.status = 'PENDING_STUDENT';
      } else if (status !== 'ALL') {
        params.status = status;
      }

      if (onlyAssignedToMe) {
        params.scope = 'assigned';
      }

      const res = await api.get('/tickets', params);
      setTickets(res.tickets || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch tickets:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [category, priority, status, page, defaultStatus, onlyEscalated, onlyPendingAction, onlyAssignedToMe]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{title}</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={fetchTickets} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
          {onOpenCreateModal && (
            <button onClick={onOpenCreateModal} className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Raise Ticket
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 160px auto',
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
              placeholder="Search by title, description, or ticket number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="glass-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            className="glass-select"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent (8h)</option>
            <option value="HIGH">High (24h)</option>
            <option value="MEDIUM">Medium (48h)</option>
            <option value="LOW">Low (72h)</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>

        {/* Status Pill Tabs (if not restricted) */}
        {!onlyEscalated && !onlyPendingAction && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              overflowX: 'auto',
            }}
          >
            {STATUSES.map((st) => {
              const active = status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatus(st);
                    setPage(1);
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket List Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw className="spin" size={28} style={{ margin: '0 auto 12px' }} />
          Loading institutional support tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Inbox size={48} color="var(--text-sub)" />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>No tickets found matching criteria</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
            No tickets match your current filters. Try resetting the status or raising a new request.
          </p>
          {onOpenCreateModal && (
            <button onClick={onOpenCreateModal} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
              <PlusCircle size={15} /> Raise Support Ticket
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {tickets.map((t) => (
            <TicketCard
              key={t._id}
              ticket={t}
              onClick={(clicked) => setSelectedTicket(clicked._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '6px 12px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticketId={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRefresh={fetchTickets}
        />
      )}
    </div>
  );
};
