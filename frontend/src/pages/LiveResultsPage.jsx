import React, { useState, useEffect } from 'react';
import {
  Zap, ArrowLeft, Share2, Vote, RefreshCw, Radio, CheckCircle2,
  Lock, Sparkles, Users
} from 'lucide-react';
import { api } from '../services/api';
import { connectPollWebSocket } from '../services/websocket';

export default function LiveResultsPage({ pollId, onBack, onGoToVote, onOpenShare, showToast }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected'
  const [lastVoteNotice, setLastVoteNotice] = useState(null);
  const [error, setError] = useState('');

  // 1. Initial REST fetch for poll data
  const loadPollData = async () => {
    try {
      const data = await api.getPoll(pollId);
      setPoll(data);
    } catch (err) {
      setError(err.message || 'Failed to load poll results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPollData();

    // 2. Connect to WebSocket for instant real-time live updates
    const disconnectWs = connectPollWebSocket(
      pollId,
      (event) => {
        // Instant Realtime Update from Redis Pub/Sub -> WebSocket!
        console.log('[LiveResults] Received real-time vote update:', event);
        setPoll((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalVotes: event.totalVotes,
            options: event.options,
          };
        });

        // Trigger flash notification showing which option got the vote
        setLastVoteNotice('Vote received! Results updated instantly');
        setTimeout(() => setLastVoteNotice(null), 2500);
      },
      (status) => {
        setWsStatus(status);
      }
    );

    return () => {
      disconnectWs();
    };
  }, [pollId]);

  const handleToggleClose = async () => {
    if (!poll) return;
    const newStatus = poll.status === 'closed' ? 'active' : 'closed';
    try {
      await api.updateStatus(poll.id, newStatus);
      setPoll({ ...poll, status: newStatus });
      if (showToast) showToast(newStatus === 'closed' ? 'Poll closed' : 'Poll reopened');
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="poll-audience-page">
        <div className="audience-box-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 12px' }} />
          <div style={{ color: '#6B7280', fontSize: '15px' }}>Connecting to live poll stream...</div>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="poll-audience-page">
        <div className="audience-box-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Error Loading Poll</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
          <button className="btn-primary" onClick={onBack}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  let maxVotes = -1;
  if (poll && poll.options) {
    poll.options.forEach((opt) => {
      if (opt.votesCount > maxVotes) maxVotes = opt.votesCount;
    });
  }

  const isClosed = poll && poll.status === 'closed';

  return (
    <div className="poll-audience-page">
      {/* Header bar */}
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
          {!isClosed && (
            <button className="btn-card-action primary" onClick={() => onGoToVote(poll.id)}>
              <Vote size={13} />
              <span>Vote</span>
            </button>
          )}
          <button className="btn-card-action" onClick={onBack}>
            <ArrowLeft size={13} />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      <div className="audience-content-wrap">
        <div className="audience-box-card live-results-box">
          {/* Top Row: Live Results Title + LIVE Badge + Total Votes */}
          <div className="live-results-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="live-results-title">Live Results</h2>
              {isClosed ? (
                <span className="status-pill closed">
                  <Lock size={11} /> Closed
                </span>
              ) : (
                <span className="status-pill live">
                  <span className="pulse-dot"></span> LIVE
                </span>
              )}
            </div>

            <div className="live-results-total-badge">
              <span>{poll.totalVotes || 0} total votes</span>
            </div>
          </div>

          {/* Question Title */}
          <h1 className="live-results-question">{poll.question}</h1>

          {/* Real-time Results Progress Bars matching Frame 10 */}
          <div className="live-bars-stack">
            {poll.options.map((option) => {
              const pct = Math.round(option.percentage || 0);
              const isLeading = maxVotes > 0 && option.votesCount === maxVotes;

              return (
                <div key={option.id} className="live-bar-item">
                  <div className="live-bar-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="live-bar-label">{option.text}</span>
                      {isLeading && (
                        <span className="leading-pill">Leading</span>
                      )}
                    </div>
                    <div className="live-bar-stats">
                      <span className="live-bar-pct">{pct}%</span>
                      <span className="live-bar-count">({option.votesCount} votes)</span>
                    </div>
                  </div>

                  <div className="live-track">
                    <div
                      className={`live-fill ${isLeading ? 'leading' : ''}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Flash Notification Badge */}
          {lastVoteNotice && (
            <div className="live-vote-toast">
              <Sparkles size={14} color="#059669" />
              <span>{lastVoteNotice}</span>
            </div>
          )}

          {/* Bottom Avatars & Real-time Indicator matching Frame 10 */}
          <div className="live-results-footer">
            <div className="people-voting-wrap">
              <div className="avatar-stack">
                <div className="mini-avatar" style={{ background: '#EEF2FF', color: '#4F46E5' }}>P</div>
                <div className="mini-avatar" style={{ background: '#ECFDF5', color: '#059669' }}>S</div>
                <div className="mini-avatar" style={{ background: '#FEF3C7', color: '#D97706' }}>R</div>
                <div className="mini-avatar" style={{ background: '#FCE7F3', color: '#DB2777' }}>A</div>
              </div>
              <span className="people-voting-label">People are voting in real time</span>
            </div>

            <div className="ws-connection-badge">
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: wsStatus === 'connected' ? '#10B981' : (wsStatus === 'connecting' ? '#F59E0B' : '#EF4444'),
              }}></span>
              <span>
                {wsStatus === 'connected' ? 'Live WebSocket Active (Redis Pub/Sub)' : wsStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
              </span>
            </div>
          </div>

          {/* Host Controls */}
          <div className="live-host-controls">
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Host Controls</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={handleToggleClose}>
                {isClosed ? 'Reopen Poll' : 'Close Poll'}
              </button>
              <button className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={loadPollData}>
                <RefreshCw size={11} style={{ marginRight: '4px' }} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
