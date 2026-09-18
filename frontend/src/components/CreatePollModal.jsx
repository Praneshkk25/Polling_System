import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, Eye, Sparkles, Lock, Globe, Rocket } from 'lucide-react';
import { api } from '../services/api';
import Button from './ui/Button';

export default function CreatePollModal({ isOpen, onClose, onPollCreated, showToast }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [category, setCategory] = useState('Technology');
  const [imageUrl, setImageUrl] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false);
  const [autoClosePoll, setAutoClosePoll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    if (error) setError('');
  };

  const handleAddOption = () => {
    if (options.length >= 10) {
      setError('Maximum 10 options allowed');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setError('A poll must have at least 2 options');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation matching Go backend
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 5) {
      setError('Question must be at least 5 characters long');
      return;
    }
    if (trimmedQuestion.length > 250) {
      setError('Question cannot exceed 250 characters');
      return;
    }

    const trimmedOptions = options.map((opt) => opt.trim());
    if (trimmedOptions.some((opt) => opt === '')) {
      setError('All option fields must be filled in');
      return;
    }

    // Check duplicates
    const lowerSet = new Set();
    for (const opt of trimmedOptions) {
      const lower = opt.toLowerCase();
      if (lowerSet.has(lower)) {
        setError(`Duplicate option detected: "${opt}"`);
        return;
      }
      lowerSet.add(lower);
    }

    setLoading(true);
    try {
      const newPoll = await api.createPoll({
        question: trimmedQuestion,
        options: trimmedOptions,
        category,
        imageUrl: imageUrl.trim() || undefined,
        visibility,
        allowMultipleVotes,
        requireLogin,
        autoClosePoll,
      });

      if (showToast) showToast('Poll created successfully! 🎉');
      if (onPollCreated) onPollCreated(newPoll);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="modal-header">
          <h2>Create a New Poll</h2>
          <p>Ask a question, add your choices, and see results update live across connected viewers.</p>
        </div>

        {error && (
          <div className="modal-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="create-poll-grid">
          {/* Left Column: Form Controls */}
          <form onSubmit={handleSubmit} className="create-poll-form">
            <div className="form-group">
              <label className="form-label">
                Poll Question <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Which programming language do you prefer?"
                value={question}
                onChange={(e) => { setQuestion(e.target.value); if (error) setError(''); }}
                maxLength={250}
                required
              />
              <div className="input-char-counter">
                {question.length} / 250
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Options <span style={{ color: '#EF4444' }}>*</span> (Min 2, Max 10)
              </label>
              <div className="options-input-list">
                {options.map((opt, idx) => (
                  <div key={idx} className="option-row-input">
                    <span className="option-num-badge">{idx + 1}.</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="btn-remove-option"
                        onClick={() => handleRemoveOption(idx)}
                        title="Remove option"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 10 && (
                <button type="button" className="btn-add-option" onClick={handleAddOption}>
                  <Plus size={14} /> Add Another Option
                </button>
              )}
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Technology">Technology</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Environment">Environment</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Visibility</label>
                <select
                  className="form-input"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="public">Public (Visible on Explore)</option>
                  <option value="private">Private (Link Only)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Thumbnail Image URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            {/* Voting Settings */}
            <div className="voting-settings-box">
              <span className="settings-box-title">Voting Settings</span>
              <div className="settings-toggles-list">
                <label className="setting-checkbox-row">
                  <input
                    type="checkbox"
                    checked={allowMultipleVotes}
                    onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                  />
                  <div>
                    <strong>Allow multiple votes</strong>
                    <p>Permit voters to submit more than once</p>
                  </div>
                </label>

                <label className="setting-checkbox-row">
                  <input
                    type="checkbox"
                    checked={requireLogin}
                    onChange={(e) => setRequireLogin(e.target.checked)}
                  />
                  <div>
                    <strong>Require login to vote</strong>
                    <p>Voters must authenticate with an account</p>
                  </div>
                </label>

                <label className="setting-checkbox-row">
                  <input
                    type="checkbox"
                    checked={autoClosePoll}
                    onChange={(e) => setAutoClosePoll(e.target.checked)}
                  />
                  <div>
                    <strong>Auto-close poll after 7 days</strong>
                    <p>Automatically lock voting after 1 week</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" loading={loading} iconRight={Rocket}>
                Launch Poll Live
              </Button>
            </div>
          </form>

          {/* Right Column: LIVE PREVIEW PANEL */}
          <div className="create-poll-preview">
            <div className="preview-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} color="#7C3AED" />
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#4F46E5' }}>
                  Live Audience Preview
                </span>
              </div>
              <span className="status-pill live">
                <span className="pulse-dot"></span> LIVE
              </span>
            </div>

            <div className="preview-card-inner">
              <div className="preview-badge-row">
                <span className="category-tag static">{category}</span>
                <span className="preview-vis-badge">
                  {visibility === 'public' ? <Globe size={11} /> : <Lock size={11} />}
                  <span>{visibility}</span>
                </span>
              </div>

              <h4 className="preview-question">
                {question.trim() || 'Your poll question will appear here in real time...'}
              </h4>

              <div className="preview-options-list">
                {options.map((opt, idx) => (
                  <div key={idx} className="preview-option-item">
                    <div className="preview-radio-circle" />
                    <span>{opt.trim() || `Option ${idx + 1}`}</span>
                  </div>
                ))}
              </div>

              <div className="preview-footer-note">
                <span>0 votes • Real-time Redis updates enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
