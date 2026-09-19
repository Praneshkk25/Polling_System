import React, { useState, useEffect } from 'react';
import { BarChart2, Flame } from 'lucide-react';
import { api } from '../services/api';

export default function TrendingGrid({ onSelectPoll, onExploreAll, isDemoUser = false, onOpenCreate }) {
  const [trendingPolls, setTrendingPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicPolls({ sort: 'trending', excludeMock: !isDemoUser })
      .then((polls) => {
        setTrendingPolls((polls || []).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isDemoUser]);

  if (loading) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
        Loading trending community polls...
      </div>
    );
  }

  if (trendingPolls.length === 0) {
    if (!isDemoUser) {
      return (
        <div style={{ marginTop: '24px' }}>
          <div className="section-header">
            <h2>Community Polls</h2>
          </div>
          <div className="empty-polls-box" style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280', fontSize: '13.5px', marginBottom: '12px' }}>
              No community public polls published yet. Be the first to share a question with the world!
            </p>
            {onOpenCreate && (
              <button className="btn-primary" onClick={onOpenCreate}>
                + Publish a Public Poll
              </button>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div>
      <div className="section-header">
        <h2>Trending Polls</h2>
        {onExploreAll && (
          <span className="view-all-link" onClick={onExploreAll}>
            Explore All →
          </span>
        )}
      </div>

      <div className="trending-grid">
        {trendingPolls.map((poll) => (
          <div
            key={poll.id}
            className="trending-card"
            onClick={() => onSelectPoll && onSelectPoll(poll)}
          >
            <div className="trending-thumb-wrapper">
              <img
                src={poll.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80'}
                alt={poll.question}
                className="trending-thumb"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80';
                }}
              />
              <span className="category-tag">{poll.category || 'General'}</span>
            </div>

            <div className="trending-body">
              <h4 className="trending-title">{poll.question}</h4>
              <div className="trending-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BarChart2 size={12} />
                  <span>{poll.totalVotes || 0} votes</span>
                </div>
                <span className="trending-badge">
                  <Flame size={12} /> Trending
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
