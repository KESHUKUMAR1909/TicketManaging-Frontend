import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SLAIndicator } from './SLAIndicator';
import {
  X,
  Send,
  Lock,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Image as ImageIcon,
  Star,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

export const TicketDetailModal = ({ ticketId, onClose, onRefresh }) => {
  const { user, isStudent, isStaff, isAdmin, isManagement } = useAuth();
  const [ticketData, setTicketData] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Form states
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachmentLink, setAttachmentLink] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Workflow action states
  const [actionModal, setActionModal] = useState(null); // 'PENDING' | 'RESOLVE' | 'ESCALATE' | 'RATE'
  const [actionInput, setActionInput] = useState('');
  const [ratingStars, setRatingStars] = useState(5);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      setTicketData(res.ticket);
      setActivityLogs(res.activityLogs || []);
    } catch (err) {
      console.error('Failed to load ticket:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    if (!isStudent) {
      api.get('/users/staff')
        .then((res) => setStaffList(res.staff || []))
        .catch((e) => console.log(e));
    }
  }, [ticketId]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.post(`/tickets/${ticketId}/comments`, {
        message: commentText,
        isInternal: isInternalNote,
        attachmentUrl: attachmentLink,
      });
      setCommentText('');
      setAttachmentLink('');
      setIsInternalNote(false);
      await fetchTicketDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Error posting comment: ${err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleWorkflowTransition = async (targetStatus, note = '') => {
    setActionSubmitting(true);
    try {
      if (targetStatus === 'ESCALATED') {
        await api.post(`/tickets/${ticketId}/escalate`, { reason: note });
      } else {
        await api.patch(`/tickets/${ticketId}/status`, {
          status: targetStatus,
          note,
          resolutionNotes: targetStatus === 'RESOLVED' ? note : undefined,
        });
      }
      setActionModal(null);
      setActionInput('');
      await fetchTicketDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleAssignTicket = async (targetUserId) => {
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { assignedToUserId: targetUserId });
      await fetchTicketDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await api.patch(`/tickets/${ticketId}/priority`, { priority: newPriority });
      await fetchTicketDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Priority update failed: ${err.message}`);
    }
  };

  const handleRateResolution = async () => {
    setActionSubmitting(true);
    try {
      await api.post(`/tickets/${ticketId}/rate`, {
        rating: ratingStars,
        feedback: actionInput,
      });
      setActionModal(null);
      await fetchTicketDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Rating failed: ${err.message}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  if (loading || !ticketData) {
    return (
      <div className="modal-backdrop">
        <div className="glass-panel" style={{ padding: '40px', color: '#fff' }}>
          <RefreshCw className="spin" size={24} /> Loading ticket details...
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 15, 25, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8' }}>
              {ticketData.ticketNumber}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '3px 10px',
                borderRadius: '6px',
                color: 'var(--text-muted)',
              }}
            >
              {ticketData.category}
            </span>
            <span className={`badge priority-${ticketData.priority.toLowerCase()}`}>
              {ticketData.priority}
            </span>
            <span className={`badge badge-${ticketData.status.toLowerCase()}`}>
              {ticketData.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SLAIndicator ticket={ticketData} />
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Left Column: Details & Audit Conversation History */}
          <div style={{ padding: '24px 28px', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* Title & Description */}
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              {ticketData.title}
            </h2>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: '#e2e8f0',
              }}
            >
              {ticketData.description}

              {/* Attached Image Link Preview */}
              {ticketData.attachmentUrl && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <ImageIcon size={14} /> Attached Image Link:
                  </div>
                  <a
                    href={ticketData.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}
                  >
                    <img
                      src={ticketData.attachmentUrl}
                      alt="Ticket Attachment"
                      style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Open full image in new tab <ExternalLink size={12} />
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Pending Action Banner if student action needed */}
            {ticketData.status === 'PENDING_STUDENT' && ticketData.pendingAction?.isPending && (
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <AlertTriangle size={22} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#e9d5ff', fontSize: '0.95rem', marginBottom: '4px' }}>
                    Action Required by Student
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#f3e8ff', lineHeight: 1.5 }}>
                    {ticketData.pendingAction.pendingReason}
                  </div>
                  {isStudent && (
                    <div style={{ fontSize: '0.75rem', color: '#d8b4fe', marginTop: '8px', fontWeight: 600 }}>
                      ℹ️ Simply post a reply below to automatically clear this hold and resume ticket processing.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resolution Banner */}
            {ticketData.status === 'RESOLVED' && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, marginBottom: '6px' }}>
                  <CheckCircle2 size={18} />
                  Staff Resolution Remarks
                </div>
                <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {ticketData.resolution?.resolutionNotes || 'Resolution provided by assigned team.'}
                </p>
                {isStudent && !ticketData.satisfaction?.rating && (
                  <button
                    onClick={() => setActionModal('RATE')}
                    className="btn btn-success btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    <Star size={14} fill="#fff" />
                    Rate Resolution & Close Ticket
                  </button>
                )}
              </div>
            )}

            {/* Activity History & Audit Conversation Timeline */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Activity History & Updates ({activityLogs.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activityLogs.map((log) => {
                  const isInternal = log.meta?.isInternal;
                  return (
                    <div
                      key={log._id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: isInternal
                          ? 'rgba(245, 158, 11, 0.08)'
                          : log.action === 'ESCALATED'
                          ? 'rgba(239, 68, 68, 0.08)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isInternal
                          ? '1px dashed rgba(245, 158, 11, 0.4)'
                          : log.action === 'ESCALATED'
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                            {log.user?.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-sub)',
                            }}
                          >
                            {log.user?.role}
                          </span>
                          {isInternal && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#fbbf24',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              <Lock size={10} /> Internal Staff Note
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {log.message}
                      </div>

                      {log.meta?.attachmentUrl && (
                        <div style={{ marginTop: '8px' }}>
                          <a
                            href={log.meta.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-block' }}
                          >
                            <img
                              src={log.meta.attachmentUrl}
                              alt="Log attachment"
                              style={{ maxHeight: '100px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  className="glass-textarea"
                  rows={3}
                  placeholder={
                    ticketData.status === 'PENDING_STUDENT' && isStudent
                      ? 'Type your clarification or response to unblock this ticket...'
                      : 'Type a reply or update...'
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="url"
                    className="glass-input"
                    placeholder="Optional image link attachment URL (https://...)"
                    value={attachmentLink}
                    onChange={(e) => setAttachmentLink(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  />
                  {attachmentLink && (
                    <a href={attachmentLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#818cf8', whiteSpace: 'nowrap' }}>
                      Test Link
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {!isStudent ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#fbbf24', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                      />
                      <Lock size={13} /> Visible to Staff Only (Internal Note)
                    </label>
                  ) : <div />}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment || !commentText.trim()}
                  >
                    <Send size={15} />
                    {submittingComment ? 'Posting...' : 'Post Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Workflow Control Panel & Meta Info */}
          <div style={{ padding: '24px 20px', background: 'rgba(10, 15, 25, 0.25)' }}>
            {/* Staff / Admin Actions Panel */}
            {!isStudent && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-sub)', marginBottom: '12px' }}>
                  Staff Workflow Actions
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Claim or Reassign */}
                  {ticketData.assignedTo?._id !== user._id && (
                    <button
                      onClick={() => handleAssignTicket(user._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <User size={14} color="#818cf8" />
                      Claim Ticket (Self-Assign)
                    </button>
                  )}

                  {/* Reassign dropdown for Admin/Staff */}
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      Reassign Ownership:
                    </label>
                    <select
                      className="glass-select"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      value={ticketData.assignedTo?._id || ''}
                      onChange={(e) => handleAssignTicket(e.target.value)}
                    >
                      <option value="">-- Select Staff Assignee --</option>
                      {staffList.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} ({st.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Change Priority */}
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      Change Priority (Recalculates SLA):
                    </label>
                    <select
                      className="glass-select"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      value={ticketData.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                    >
                      <option value="LOW">LOW (72h SLA)</option>
                      <option value="MEDIUM">MEDIUM (48h SLA)</option>
                      <option value="HIGH">HIGH (24h SLA)</option>
                      <option value="URGENT">URGENT (8h SLA)</option>
                    </select>
                  </div>

                  {/* Set to In Progress */}
                  {ticketData.status !== 'IN_PROGRESS' && ticketData.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleWorkflowTransition('IN_PROGRESS')}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <Clock size={14} color="#fbbf24" />
                      Set to In Progress
                    </button>
                  )}

                  {/* Request Pending Action from student */}
                  {ticketData.status !== 'PENDING_STUDENT' && ticketData.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setActionModal('PENDING')}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <AlertTriangle size={14} color="#c084fc" />
                      Request Student Action (On Hold)
                    </button>
                  )}

                  {/* Resolve Ticket */}
                  {ticketData.status !== 'RESOLVED' && ticketData.status !== 'CLOSED' && (
                    <button
                      onClick={() => setActionModal('RESOLVE')}
                      className="btn btn-success btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <CheckCircle2 size={14} />
                      Mark as Resolved
                    </button>
                  )}

                  {/* Escalate */}
                  {ticketData.status !== 'ESCALATED' && (
                    <button
                      onClick={() => setActionModal('ESCALATE')}
                      className="btn btn-danger btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <AlertOctagon size={14} />
                      Escalate to Management
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Ownership & Student Profile Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <h5 style={{ fontSize: '0.78rem', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Student Information
              </h5>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                {ticketData.student?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {ticketData.student?.rollNumber} • {ticketData.student?.program}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>
                {ticketData.student?.email}
              </div>
              {ticketData.student?.phone && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                  📞 {ticketData.student?.phone}
                </div>
              )}
            </div>

            {/* Department & Assignment */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <h5 style={{ fontSize: '0.78rem', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Assignment & SLAs
              </h5>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-sub)' }}>Department:</span>{' '}
                <strong style={{ color: '#fff' }}>{ticketData.department}</strong>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-sub)' }}>Owner Staff:</span>{' '}
                <strong style={{ color: '#fff' }}>
                  {ticketData.assignedTo?.name || 'Unassigned'}
                </strong>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-sub)' }}>Created:</span>{' '}
                {new Date(ticketData.createdAt).toLocaleDateString()} at{' '}
                {new Date(ticketData.createdAt).toLocaleTimeString()}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-sub)' }}>Resolution Due:</span>{' '}
                {new Date(ticketData.sla.resolutionDue).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Prompt Sub-Modal */}
        {actionModal && (
          <div className="modal-backdrop" style={{ zIndex: 1100 }}>
            <div
              className="glass-panel"
              style={{ width: '90%', maxWidth: '450px', padding: '24px' }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>
                {actionModal === 'PENDING' && 'Request Pending Action from Student'}
                {actionModal === 'RESOLVE' && 'Provide Ticket Resolution Remarks'}
                {actionModal === 'ESCALATE' && 'Escalate Ticket to Management'}
                {actionModal === 'RATE' && 'Rate Support Satisfaction'}
              </h3>

              {actionModal === 'RATE' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                    Satisfaction Rating (1 to 5 Stars):
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Star
                          size={24}
                          color={star <= ratingStars ? '#fbbf24' : '#64748b'}
                          fill={star <= ratingStars ? '#fbbf24' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                className="glass-textarea"
                rows={4}
                placeholder={
                  actionModal === 'PENDING'
                    ? 'State clearly what information, receipt, or document the student needs to provide...'
                    : actionModal === 'RESOLVE'
                    ? 'Summary of steps taken and final resolution given to student...'
                    : actionModal === 'ESCALATE'
                    ? 'Reason for urgency or SLA breach escalation...'
                    : 'Any additional feedback or remarks...'
                }
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                style={{ marginBottom: '16px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActionModal(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={actionModal === 'ESCALATE' ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'}
                  disabled={actionSubmitting}
                  onClick={() => {
                    if (actionModal === 'PENDING') handleWorkflowTransition('PENDING_STUDENT', actionInput);
                    if (actionModal === 'RESOLVE') handleWorkflowTransition('RESOLVED', actionInput);
                    if (actionModal === 'ESCALATE') handleWorkflowTransition('ESCALATED', actionInput);
                    if (actionModal === 'RATE') handleRateResolution();
                  }}
                >
                  {actionSubmitting ? 'Submitting...' : 'Confirm Action'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
