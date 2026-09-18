import React, { useState } from 'react';
import {
  Share2, Eye, BarChart2, MoreVertical, CheckCircle2, Lock,
  Copy, Edit3, Trash2, Radio
} from 'lucide-react';
import Button from './ui/Button';

export default function PollCard({
  poll,
  onOpenShare,
  onOpenVote,
  onOpenResults,
  onClosePoll,
  onReopenPoll,
  onDuplicatePoll,
  onEditPoll,
  onDeletePoll,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="status-pill live">
            <span className="pulse-dot"></span> Live
          </span>
        );
      case 'closed':
        return (
          <span className="status-pill closed">
            <Lock size={11} style={{ marginRight: '2px' }} /> Closed
          </span>
        );
      case 'draft':
        return (
          <span className="status-pill draft">
            • Draft
          </span>
        );
      default:
        return <span className="status-pill live"><span className="pulse-dot"></span> Live</span>;
    }
  };

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K views';
    return `${views} views`;
  };

  const formatCreated = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const diffDays = Math.round((Date.now() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return 'Created today';
    if (diffDays === 1) return 'Created 1 day ago';
    if (diffDays < 7) return `Created ${diffDays} days ago`;
    if (diffDays < 14) return 'Created 1 week ago';
    return `Created ${Math.round(diffDays / 7)} weeks ago`;
  };

  const isClosed = poll.status === 'closed';

  return (
    <div className="poll-card">
      <div className="poll-card-left">
        <img
          src={poll.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80'}
          alt="Thumbnail"
          className="poll-thumb"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80';
          }}
        />

        <div className="poll-meta-wrap">
          <div className="poll-title-row">
            <h3 className="poll-title">{poll.question}</h3>
            {getStatusBadge(poll.status)}
          </div>
          <span className="poll-date-text">
            {formatCreated(poll.createdAt)} • <span style={{ color: '#7C3AED', fontWeight: 600 }}>{poll.category || 'General'}</span>
          </span>
          <div className="poll-stats-row">
            <div className="poll-stat-item">
              <BarChart2 size={13} color="#6B7280" />
              <span>{poll.totalVotes || 0} votes</span>
            </div>
            <div className="poll-stat-item">
              <Eye size={13} color="#6B7280" />
              <span>{formatViews(poll.totalViews)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="poll-card-actions">
        <Button
          variant="secondary"
          size="sm"
          iconLeft={Share2}
          onClick={() => onOpenShare(poll)}
          title="Share link & QR"
        >
          Share
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenVote(poll)}
          title="Audience vote view"
        >
          View
        </Button>

        <Button
          variant="secondary"
          size="sm"
          iconLeft={BarChart2}
          onClick={() => onOpenResults(poll)}
          title="Watch live results"
        >
          Results
        </Button>

        {/* 3-Dots Dropdown with Complete Actions */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-card-dots"
            onClick={() => setShowMenu(!showMenu)}
            title="More Options"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div
              className="card-dropdown-menu"
              onMouseLeave={() => setShowMenu(false)}
            >
              {onDuplicatePoll && (
                <button
                  className="dropdown-item"
                  onClick={() => { setShowMenu(false); onDuplicatePoll(poll.id); }}
                >
                  <Copy size={13} />
                  <span>Duplicate Poll</span>
                </button>
              )}

              {onEditPoll && (
                <button
                  className="dropdown-item"
                  onClick={() => { setShowMenu(false); onEditPoll(poll); }}
                >
                  <Edit3 size={13} />
                  <span>Edit Poll</span>
                </button>
              )}

              {!isClosed && onClosePoll && (
                <button
                  className="dropdown-item warning"
                  onClick={() => { setShowMenu(false); onClosePoll(poll.id); }}
                >
                  <Lock size={13} />
                  <span>Close Poll</span>
                </button>
              )}

              {isClosed && onReopenPoll && (
                <button
                  className="dropdown-item"
                  onClick={() => { setShowMenu(false); onReopenPoll(poll.id); }}
                >
                  <CheckCircle2 size={13} />
                  <span>Reopen Poll</span>
                </button>
              )}

              {onDeletePoll && (
                <button
                  className="dropdown-item danger"
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm(`Are you sure you want to delete poll: "${poll.question}"?`)) {
                      onDeletePoll(poll.id);
                    }
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete Poll</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
