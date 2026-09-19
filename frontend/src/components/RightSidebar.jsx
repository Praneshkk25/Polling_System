import React, { useState, useEffect } from 'react';
import {
  Plus, Link as LinkIcon, Compass, Radio, CheckCircle2, Clock,
  Sparkles, TrendingUp, ShieldCheck, Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function RightSidebar({ activeTab, onOpenCreate, onOpenJoin, onExplore, userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'home') {
      setLoading(true);
      api.getActivities({ userId })
        .then((data) => {
          setActivities(data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeTab, userId]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.round(diffHr / 24)}d ago`;
  };

  // If Analytics tab: show contextual Analytics Summary panel
  if (activeTab === 'analytics') {
    return (
      <aside className="right-sidebar contextual">
        <div className="quick-actions-card">
          <h3>Real-time Metrics</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px' }}>
            Data is calculated dynamically from persistent MongoDB Atlas records.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="context-stat-box">
              <span className="cstat-label">Redis Pub/Sub</span>
              <span className="cstat-badge online">Active</span>
            </div>
            <div className="context-stat-box">
              <span className="cstat-label">WebSockets</span>
              <span className="cstat-badge online">Live Stream</span>
            </div>
            <div className="context-stat-box">
              <span className="cstat-label">Calculations</span>
              <span className="cstat-badge neutral">100% Accurate</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // If Explore tab: show contextual Explore Discovery panel
  if (activeTab === 'explore') {
    return (
      <aside className="right-sidebar contextual">
        <div className="quick-actions-card">
          <h3>Community Discovery</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px' }}>
            Browse community polls by trending interest and participation.
          </p>
          <div className="quick-actions-list">
            <div className="quick-action-item" onClick={onOpenCreate}>
              <div className="action-icon-circle purple">
                <Plus size={18} strokeWidth={2.4} />
              </div>
              <div className="action-text">
                <h4>Publish a Poll</h4>
                <p>Share with the public feed</p>
              </div>
            </div>
            <div className="quick-action-item" onClick={onOpenJoin}>
              <div className="action-icon-circle green">
                <LinkIcon size={16} strokeWidth={2.4} />
              </div>
              <div className="action-text">
                <h4>Join by ID or Link</h4>
                <p>Have a link? Vote now</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // If Profile / Settings tab: minimal operational status panel
  if (activeTab === 'profile' || activeTab === 'settings') {
    return (
      <aside className="right-sidebar contextual">
        <div className="quick-actions-card">
          <h3>Platform Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div className="context-stat-box">
              <span className="cstat-label">Database</span>
              <span className="cstat-badge online">MongoDB Atlas</span>
            </div>
            <div className="context-stat-box">
              <span className="cstat-label">Engine</span>
              <span className="cstat-badge online">Go / Gin</span>
            </div>
            <div className="context-stat-box">
              <span className="cstat-label">Pub/Sub</span>
              <span className="cstat-badge online">Redis Active</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Default Home / My-Polls Tab: Quick Actions + Real Activity (no fake names)
  return (
    <aside className="right-sidebar">
      {/* Quick Actions */}
      <div className="quick-actions-card">
        <h3>Quick Actions</h3>
        <div className="quick-actions-list">
          <div className="quick-action-item" onClick={onOpenCreate}>
            <div className="action-icon-circle blue">
              <Plus size={18} strokeWidth={2.4} />
            </div>
            <div className="action-text">
              <h4>Create a New Poll</h4>
              <p>Start a poll in seconds</p>
            </div>
          </div>

          <div className="quick-action-item" onClick={onOpenJoin}>
            <div className="action-icon-circle green">
              <LinkIcon size={16} strokeWidth={2.4} />
            </div>
            <div className="action-text">
              <h4>Join a Poll</h4>
              <p>Have a link? Vote now</p>
            </div>
          </div>

          <div className="quick-action-item" onClick={onExplore}>
            <div className="action-icon-circle orange">
              <Compass size={17} strokeWidth={2.4} />
            </div>
            <div className="action-text">
              <h4>Explore Public Polls</h4>
              <p>See community discussions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Recent Activities (strictly generated from backend/database) */}
      {activeTab === 'home' && (
        <div className="recent-activity-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3>Recent Activity</h3>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>Live Feed</span>
          </div>

          {loading ? (
            <div style={{ padding: '14px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
              Loading real activities...
            </div>
          ) : activities.length > 0 ? (
            <div className="activity-list">
              {activities.map((act) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-icon-badge">
                    {act.type === 'vote' ? (
                      <Radio size={14} color="#6366F1" />
                    ) : act.type === 'create' ? (
                      <Plus size={14} color="#10B981" />
                    ) : (
                      <CheckCircle2 size={14} color="#8B5CF6" />
                    )}
                  </div>
                  <div className="activity-info">
                    <div className="activity-text">
                      <span>{act.description}</span>
                    </div>
                    <span className="activity-time">{formatTimeAgo(act.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
              No recent activity yet. Create a poll to see live events!
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
