import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Star,
  Layers,
  Building,
  RefreshCw,
} from 'lucide-react';

export const AnalyticsDashboardView = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load metrics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw className="spin" size={28} style={{ margin: '0 auto 12px' }} />
        Aggregating management visibility analytics...
      </div>
    );
  }

  const {
    totalTickets,
    activeTickets,
    statusMap,
    breachedCount,
    escalatedCount,
    slaComplianceRate,
    avgResolutionHours,
    avgSatisfaction,
    totalRatings,
    categoryCounts = [],
    departmentCounts = [],
    ageingBuckets = {},
  } = metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="#818cf8" />
          Management & Executive Visibility Dashboard
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Real-time institutional SLAs, ticket ageing, resolution tracking, and department workload.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        {/* Total Volume */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Ticket Volume</span>
            <Layers size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{totalTickets}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>
            {activeTickets} currently active in backlog
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>SLA Compliance Rate</span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: slaComplianceRate >= 80 ? '#34d399' : '#f87171' }}>
            {slaComplianceRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>
            {breachedCount} tickets breached deadline
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Avg Resolution Turnaround</span>
            <Clock size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
            {avgResolutionHours}h
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>
            From ticket creation to signoff
          </div>
        </div>

        {/* Escalations & Breaches */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Escalated to Management</span>
            <AlertOctagon size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171' }}>
            {escalatedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>
            Urgent attention required
          </div>
        </div>

        {/* Student Satisfaction */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Student CSAT Rating</span>
            <Star size={18} color="#fbbf24" fill="#fbbf24" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
            {avgSatisfaction || 5.0} <span style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>/ 5</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>
            Based on {totalRatings} student reviews
          </div>
        </div>
      </div>

      {/* Ticket Ageing Breakdown Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#818cf8" />
          Ticket Ageing Analysis (Active Unresolved Backlog)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>&lt; 24 Hours Age</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
              {ageingBuckets.under24h || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '4px' }}>Freshly Raised</div>
          </div>

          <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>24 to 48 Hours</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
              {ageingBuckets.between24And48h || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '4px' }}>Within target SLA</div>
          </div>

          <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: '#fb923c', fontWeight: 600 }}>48 to 72 Hours</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
              {ageingBuckets.between48And72h || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '4px' }}>At Risk of Breach</div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>&gt; 72 Hours Age</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '6px' }}>
              {ageingBuckets.over72h || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '4px' }}>Critical Stale Backlog</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Categories & Departments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* By Category */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Volume Distribution by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryCounts.map((cat) => {
              const pct = totalTickets > 0 ? Math.round((cat.count / totalTickets) * 100) : 0;
              return (
                <div key={cat._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#fff' }}>{cat._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{cat.count} tickets ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Department */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Workload Distribution by Department
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {departmentCounts.map((dep) => {
              const pct = totalTickets > 0 ? Math.round((dep.count / totalTickets) * 100) : 0;
              return (
                <div key={dep._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#fff' }}>{dep._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{dep.count} tickets ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
