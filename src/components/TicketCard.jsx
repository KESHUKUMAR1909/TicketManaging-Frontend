import React from 'react';
import { SLAIndicator } from './SLAIndicator';
import {
  Tag,
  User,
  Paperclip,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  Star,
} from 'lucide-react';

export const TicketCard = ({ ticket, onClick }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="badge badge-open">Open</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-in_progress">In Progress</span>;
      case 'PENDING_STUDENT':
        return <span className="badge badge-pending_student">Action Required</span>;
      case 'RESOLVED':
        return <span className="badge badge-resolved">Resolved</span>;
      case 'CLOSED':
        return <span className="badge badge-closed">Closed</span>;
      case 'ESCALATED':
        return <span className="badge badge-escalated">Escalated</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority.toLowerCase();
    return <span className={`badge priority-${p}`}>{priority}</span>;
  };

  return (
    <div
      onClick={() => onClick(ticket)}
      className="glass-card"
      style={{
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Escalation ribbon */}
      {ticket.status === 'ESCALATED' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #ef4444, #f97316)',
            boxShadow: '0 0 10px #ef4444',
          }}
        />
      )}

      {/* Top Meta Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.04em' }}>
            {ticket.ticketNumber}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            {ticket.category}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getPriorityBadge(ticket.priority)}
          {getStatusBadge(ticket.status)}
        </div>
      </div>

      {/* Title & Preview */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
          {ticket.title}
        </h3>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {ticket.description}
        </p>
      </div>

      {/* Pending Action Banner if student action needed */}
      {ticket.status === 'PENDING_STUDENT' && ticket.pendingAction?.isPending && (
        <div
          style={{
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.8rem',
            color: '#e9d5ff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={15} color="#c084fc" />
          <span>Pending Student Response: {ticket.pendingAction.pendingReason}</span>
        </div>
      )}

      {/* Bottom Metadata & SLA */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-sub)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} />
            {ticket.student?.name || 'Student'} ({ticket.student?.rollNumber || 'ID'})
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} />
            Age: {ticket.ageHours || 0}h
          </span>

          {ticket.attachmentUrl && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8' }}>
              <Paperclip size={13} /> Image
            </span>
          )}

          {ticket.satisfaction?.rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
              <Star size={13} fill="#fbbf24" /> {ticket.satisfaction.rating}/5
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SLAIndicator ticket={ticket} />
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', borderRadius: '6px' }}
            onClick={(e) => {
              e.stopPropagation();
              onClick(ticket);
            }}
          >
            View <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
