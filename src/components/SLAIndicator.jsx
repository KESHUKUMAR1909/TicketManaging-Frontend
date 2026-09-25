import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const SLAIndicator = ({ ticket }) => {
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isBreached, setIsBreached] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      if (['RESOLVED', 'CLOSED'].includes(ticket.status)) {
        setTimeLeftStr(`Resolved in ${ticket.resolution?.resolutionTimeHours || 0}h`);
        setIsBreached(ticket.sla?.isResolutionBreached || false);
        return;
      }

      const now = new Date().getTime();
      const due = new Date(ticket.sla.resolutionDue).getTime();
      const diff = due - now;

      if (diff <= 0 || ticket.sla.isResolutionBreached) {
        setIsBreached(true);
        const overdueHours = Math.abs(Math.round(diff / (1000 * 60 * 60)));
        setTimeLeftStr(`SLA Breached (+${overdueHours}h)`);
      } else {
        setIsBreached(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeftStr(`${hours}h ${minutes}m remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [ticket]);

  if (['RESOLVED', 'CLOSED'].includes(ticket.status)) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.75rem',
          color: '#34d399',
          background: 'rgba(16, 185, 129, 0.12)',
          padding: '3px 8px',
          borderRadius: '6px',
        }}
      >
        <CheckCircle size={13} />
        {timeLeftStr}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: isBreached ? '#f87171' : '#38bdf8',
        background: isBreached ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)',
        border: isBreached ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.25)',
        padding: '3px 9px',
        borderRadius: '6px',
        boxShadow: isBreached ? '0 0 10px rgba(239, 68, 68, 0.25)' : 'none',
      }}
    >
      {isBreached ? <AlertTriangle size={13} /> : <Clock size={13} />}
      {timeLeftStr}
    </span>
  );
};
