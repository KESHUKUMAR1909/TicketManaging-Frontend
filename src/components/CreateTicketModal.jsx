import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Send, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Fees',
  'Attendance',
  'ID Cards',
  'Documents',
  'Certificates',
  'Administrative',
  'Other',
];

const SAMPLE_IMAGE_LINKS = [
  { label: 'Fee Receipt', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Identity Card', url: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=800&q=80' },
  { label: 'Medical Document', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80' },
];

export const CreateTicketModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fees');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in the subject and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/tickets', {
        title,
        category,
        priority,
        description,
        attachmentUrl,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Raise Support Ticket</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Institutional assistance for academic, administrative, and financial issues
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Issue Category *
              </label>
              <select
                className="glass-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Priority & SLA *
              </label>
              <select
                className="glass-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low (72h Resolution SLA)</option>
                <option value="MEDIUM">Medium (48h Resolution SLA)</option>
                <option value="HIGH">High (24h Resolution SLA)</option>
                <option value="URGENT">Urgent (8h Resolution SLA)</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Subject / Title *
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Duplicate fee charge on portal or Bonafide certificate request"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Detailed Description *
            </label>
            <textarea
              className="glass-textarea"
              rows={4}
              placeholder="Describe your issue with relevant dates, transaction numbers, or academic terms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Image Link Attachment */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Document / Screenshot Attachment (Image Link URL)
            </label>
            <input
              type="url"
              className="glass-input"
              placeholder="Paste public image link URL (e.g. https://images.unsplash.com/...)"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />

            {/* Quick sample image link helper buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Sample Image Links:</span>
              {SAMPLE_IMAGE_LINKS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setAttachmentUrl(sample.url)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Live image preview */}
            {attachmentUrl && (
              <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#818cf8', display: 'block', marginBottom: '6px' }}>
                  Live Image Preview:
                </span>
                <img
                  src={attachmentUrl}
                  alt="Attachment Preview"
                  style={{ maxHeight: '140px', borderRadius: '6px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
