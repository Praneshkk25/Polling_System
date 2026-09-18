import React, { useState, useEffect } from 'react';
import {
  Zap, ArrowLeft, CheckCircle2, Lock, Share2, BarChart2,
  AlertCircle, Users, Radio, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function VotingPage({ pollId, onBack, onGoToResults, onOpenShare, showToast }) {
  const [poll, setPoll] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if voter already cast vote locally
    const votedMap = JSON.parse(localStorage.getItem('pulsepoll_voted_map') || '{}');
    if (votedMap[pollId]) {
      setHasAlreadyVoted(true);
    }

    api.getPoll(pollId)
      .then((data) => {
        setPoll(data);
      })
      .catch((err) => {
        setError(err.message || 'Could not load poll');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pollId]);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionId) {
      setError('Please select an option before voting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.castVote(pollId, selectedOptionId);

      // Save local record to prevent duplicate attempt
      const votedMap = JSON.parse(localStorage.getItem('pulsepoll_voted_map') || '{}');
      votedMap[pollId] = selectedOptionId;
      localStorage.setItem('pulsepoll_voted_map', JSON.stringify(votedMap));

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      setVoteSubmitted(true);
      if (showToast) showToast('Vote cast successfully! 🎉');

      // Auto redirect to live results after short celebration
      setTimeout(() => {
        onGoToResults(pollId);
      }, 1400);
    } catch (err) {
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('already voted'))) {
        setHasAlreadyVoted(true);
        setError('You have already voted in this poll. Viewing live results.');
      } else {
        setError(err.message || 'Failed to submit vote');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="poll-audience-page">
        <div className="audience-box-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 12px' }} />
          <div style={{ color: '#6B7280', fontSize: '15px' }}>Loading audience poll...</div>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="poll-audience-page">
        <div className="audience-box-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <AlertCircle size={44} color="#EF4444" style={{ marginBottom: '14px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Poll Not Found</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
          <button className="btn-primary" onClick={onBack}>Return Home</button>
        </div>
      </div>
    );
  }

  const isClosed = poll && poll.status === 'closed';

  return (
    <div className="poll-audience-page">
      {/* Header bar matching Frame 9 */}
      <header className="audience-top-bar">
        <div className="landing-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
          <div className="brand-logo-icon">
            <Zap size={18} color="#7C3AED" strokeWidth={2.8} />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">PulsePoll</span>
            <span className="brand-tagline">Ideas in Real Time</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn-card-action" onClick={() => onOpenShare(poll)}>
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button className="btn-card-action" onClick={() => onGoToResults(pollId)}>
            <BarChart2 size={13} />
            <span>Live Results</span>
          </button>
        </div>
      </header>

      {/* Main Audience Voting Card matching Frame 9 */}
      <div className="audience-content-wrap">
        <div className="audience-box-card">
          {/* Question Title */}
          <h1 className="audience-question-title">{poll.question}</h1>

          {/* Subtitle with voter count and live status */}
          <div className="audience-meta-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="#6B7280" />
              <span><strong>{poll.totalVotes || 0}</strong> people have voted</span>
            </div>
            <span>•</span>
            {isClosed ? (
              <span className="status-pill closed">
                <Lock size={11} /> Voting Closed
              </span>
            ) : (
              <span className="status-pill live">
                <span className="pulse-dot"></span> Live
              </span>
            )}
          </div>

          {/* Closed / Already Voted State */}
          {isClosed && (
            <div className="audience-alert-box gray">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} />
                <span>This poll is closed and no longer accepting votes.</span>
              </div>
              <button className="btn-card-action primary" onClick={() => onGoToResults(pollId)}>
                View Results
              </button>
            </div>
          )}

          {hasAlreadyVoted && !isClosed && (
            <div className="audience-alert-box green">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>You have already voted in this poll!</span>
              </div>
              <button className="btn-card-action primary" onClick={() => onGoToResults(pollId)}>
                Watch Live Results
              </button>
            </div>
          )}

          {voteSubmitted ? (
            <div className="audience-success-card">
              <Sparkles size={28} color="#7C3AED" style={{ marginBottom: '8px' }} />
              <h3>Thanks for voting! 🎉</h3>
              <p>Your vote has been counted in real time. Redirecting to live results...</p>
            </div>
          ) : (
            <form onSubmit={handleVoteSubmit} className="audience-vote-form">
              {error && (
                <div className="audience-error-msg">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Radio Options List */}
              <div className="audience-options-group">
                {poll.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`audience-option-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (!isClosed && !hasAlreadyVoted) setSelectedOptionId(option.id);
                      }}
                    >
                      <div className="audience-radio-circle">
                        {isSelected && <div className="audience-radio-dot" />}
                      </div>
                      <span className="audience-option-text">{option.text}</span>
                    </label>
                  );
                })}
              </div>

              {/* Submit Vote Button */}
              {!isClosed && !hasAlreadyVoted && (
                <button
                  type="submit"
                  className="btn-audience-submit"
                  disabled={submitting || !selectedOptionId}
                >
                  {submitting ? 'Recording Vote...' : 'Submit Vote'}
                </button>
              )}

              <div className="audience-hint-text">
                You can see results after voting
              </div>
            </form>
          )}
        </div>

        {/* Floating Voter Avatar Bubbles matching Frame 9 */}
        <div className="audience-avatars-sidebar">
          <div className="voter-bubble-group">
            <div className="floating-voter-avatar v1" title="Active voter">
              <span>JD</span>
            </div>
            <div className="floating-voter-avatar v2" title="Active voter">
              <span>SK</span>
            </div>
            <div className="floating-voter-avatar v3" title="Active voter">
              <span>AR</span>
            </div>
          </div>
          <span className="voter-hint-label">People voting live</span>
        </div>
      </div>
    </div>
  );
}
