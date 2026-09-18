import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function JoinModal({ isOpen, onClose, onJoin }) {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = (e) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) {
      setError('Please enter a poll ID or link');
      return;
    }

    // Extract poll ID if full URL pasted
    let pollId = clean;
    if (clean.includes('/poll/')) {
      const parts = clean.split('/poll/')[1].split('/')[0].split('?')[0];
      pollId = parts;
    }

    onJoin(pollId);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ width: '420px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="modal-header">
          <h2>Join a Poll</h2>
          <p>Enter the poll code or paste the link to vote.</p>
        </div>

        {error && (
          <div style={{ color: '#DC2626', fontSize: '12.5px', marginBottom: '12px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label className="form-label">Poll Code or Link</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., poll-prog-lang"
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setError(''); }}
              autoFocus
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span>Join Poll</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
