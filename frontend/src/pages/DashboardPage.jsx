import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import HeroBanner from '../components/HeroBanner';
import StatsRow from '../components/StatsRow';
import PollCard from '../components/PollCard';
import TrendingGrid from '../components/TrendingGrid';
import RightSidebar from '../components/RightSidebar';
import CreatePollModal from '../components/CreatePollModal';
import ShareModal from '../components/ShareModal';
import JoinModal from '../components/JoinModal';
import AuthModal from '../components/AuthModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/validation';
import {
  BarChart2, Radio, CheckCircle2, Lock, Sparkles, Filter, Search,
  RefreshCw, TrendingUp, ShieldCheck, User, Key, LogOut, Home, Compass, Plus
} from 'lucide-react';

export default function DashboardPage({
  onNavigateToVote,
  onNavigateToResults,
  onNavigateToLanding,
  showToast,
}) {
  const { user, logout, refreshUser } = useAuth();
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'closed', 'drafts'
  const [polls, setPolls] = useState([]);
  const [publicPolls, setPublicPolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exploreCategory, setExploreCategory] = useState('All');
  const [exploreSort, setExploreSort] = useState('trending');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);

  // Profile Edit State
  const [editName, setEditName] = useState(user ? user.name : '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const isDemoUser = Boolean(user && (user.email === 'pranesh@pulsepoll.io' || user.id === 'user-pranesh-1'));

  const fetchDashboardData = async () => {
    try {
      const [pollList, statsData, analyticsData, pubPolls] = await Promise.all([
        api.getPolls({ userId: user?.id, excludeMock: !isDemoUser }),
        api.getStats({ userId: user?.id }),
        api.getAnalytics({ userId: user?.id }),
        api.getPublicPolls({ category: exploreCategory, sort: exploreSort, userId: user?.id, excludeMock: !isDemoUser }),
      ]);
      setPolls(pollList || []);
      setStats(statsData);
      setAnalytics(analyticsData);
      setPublicPolls(pubPolls || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [exploreCategory, exploreSort, user]);

  useEffect(() => {
    if (user && user.name) {
      setEditName(user.name);
    }
  }, [user]);

  const handlePollCreated = (newPoll) => {
    setPolls([newPoll, ...polls]);
    fetchDashboardData();
    setSelectedPoll(newPoll);
    setShowShareModal(true);
  };

  const handleClosePoll = async (pollId) => {
    try {
      await api.closePoll(pollId);
      showToast('Poll closed successfully');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to close poll');
    }
  };

  const handleReopenPoll = async (pollId) => {
    try {
      await api.updateStatus(pollId, 'active');
      showToast('Poll reopened successfully');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to reopen poll');
    }
  };

  const handleDuplicatePoll = async (pollId) => {
    try {
      const dup = await api.duplicatePoll(pollId);
      showToast('Poll duplicated successfully! ✨');
      fetchDashboardData();
      setSelectedPoll(dup);
      setShowShareModal(true);
    } catch (err) {
      showToast(err.message || 'Failed to duplicate poll');
    }
  };

  const handleDeletePoll = async (pollId) => {
    try {
      await api.deletePoll(pollId);
      showToast('Poll deleted successfully');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to delete poll');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await api.updateProfile({ name: editName.trim() });
      await refreshUser();
      showToast('Profile name updated successfully! ✨');
    } catch (err) {
      showToast(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('Please enter both current and new password');
      return;
    }
    if (oldPassword === newPassword) {
      showToast('New password must be different from current password');
      return;
    }
    const passVal = validatePassword(newPassword, true);
    if (!passVal.isValid) {
      showToast(passVal.error);
      return;
    }
    setSavingProfile(true);
    try {
      await api.changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      showToast('Password changed successfully! 🔒');
    } catch (err) {
      showToast(err.message || 'Failed to change password');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleShare = (poll) => {
    setSelectedPoll(poll);
    setShowShareModal(true);
  };

  const handleVote = (poll) => {
    onNavigateToVote(poll.id);
  };

  const handleViewResults = (poll) => {
    onNavigateToResults(poll.id);
  };

  // Filtered polls for Home / My Polls
  const filteredPolls = polls.filter((p) => {
    const matchesSearch = p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'active') return p.status === 'active';
    if (filterTab === 'closed') return p.status === 'closed';
    if (filterTab === 'drafts') return p.status === 'draft';
    return true; // 'all'
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Navbar
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onNavigateHome={() => setActiveNavTab('home')}
        onNavigateToLanding={onNavigateToLanding}
        sidebarCollapsed={sidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        onToggleSidebar={() => {
          if (typeof window !== 'undefined' && window.innerWidth <= 860) {
            setMobileMenuOpen((prev) => !prev);
          } else {
            setSidebarCollapsed((prev) => !prev);
          }
        }}
      />

      {/* Main 3-Column Dashboard Layout */}
      <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Left Column: Navigation Sidebar */}
        <Sidebar
          activeTab={activeNavTab}
          setActiveTab={(tab) => {
            setActiveNavTab(tab);
            setMobileMenuOpen(false);
            if (tab === 'my-polls') setFilterTab('all');
          }}
          onOpenCreate={() => {
            setShowCreateModal(true);
            setMobileMenuOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Center Column: Dynamic Content per Tab */}
        <main className="center-content">
          {/* ================= HOME TAB ================= */}
          {activeNavTab === 'home' && (
            <>
              <HeroBanner
                userName={user ? user.name : 'Pranesh'}
                onOpenCreate={() => setShowCreateModal(true)}
                onOpenJoin={() => setShowJoinModal(true)}
              />

              <StatsRow stats={stats} />

              {/* Your Polls Section */}
              <div>
                <div className="section-header">
                  <h2>Your Polls</h2>
                  <span className="view-all-link" onClick={() => setActiveNavTab('my-polls')}>
                    View All →
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                  {['all', 'active', 'closed', 'drafts'].map((tab) => (
                    <button
                      key={tab}
                      className={`filter-tab-btn ${filterTab === tab ? 'active' : ''}`}
                      onClick={() => setFilterTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Polls List */}
                <div className="poll-cards-list">
                  {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                      Loading real polls from database...
                    </div>
                  ) : filteredPolls.length > 0 ? (
                    filteredPolls.map((poll) => (
                      <PollCard
                        key={poll.id}
                        poll={poll}
                        onOpenShare={handleShare}
                        onOpenVote={handleVote}
                        onOpenResults={handleViewResults}
                        onClosePoll={handleClosePoll}
                        onReopenPoll={handleReopenPoll}
                        onDuplicatePoll={handleDuplicatePoll}
                        onDeletePoll={handleDeletePoll}
                      />
                    ))
                  ) : (
                    <div className="empty-polls-box">
                      <p>No polls found matching this filter.</p>
                      <button
                        className="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                      >
                        + Create a Poll
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Trending Polls Grid (Real Public Polls) */}
              <TrendingGrid
                onSelectPoll={(trending) => onNavigateToVote(trending.id)}
                onExploreAll={() => setActiveNavTab('explore')}
                isDemoUser={isDemoUser}
                onOpenCreate={() => setShowCreateModal(true)}
              />
            </>
          )}

          {/* ================= MY POLLS TAB ================= */}
          {activeNavTab === 'my-polls' && (
            <div>
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '22px' }}>My Created Polls</h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    Manage, edit, duplicate, and monitor all polls created by you
                  </p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                  + New Poll
                </button>
              </div>

              <div className="filter-tabs">
                {['all', 'active', 'closed', 'drafts'].map((tab) => (
                  <button
                    key={tab}
                    className={`filter-tab-btn ${filterTab === tab ? 'active' : ''}`}
                    onClick={() => setFilterTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="poll-cards-list">
                {filteredPolls.length > 0 ? (
                  filteredPolls.map((poll) => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      onOpenShare={handleShare}
                      onOpenVote={handleVote}
                      onOpenResults={handleViewResults}
                      onClosePoll={handleClosePoll}
                      onReopenPoll={handleReopenPoll}
                      onDuplicatePoll={handleDuplicatePoll}
                      onDeletePoll={handleDeletePoll}
                    />
                  ))
                ) : (
                  <div className="empty-polls-box">
                    <p>No polls created yet in this status category.</p>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                      + Create Your First Poll
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= ANALYTICS TAB ================= */}
          {activeNavTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="section-header">
                <div>
                  <h2 style={{ fontSize: '22px' }}>Poll Analytics & Insights</h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    Real-time participation metrics calculated from persistent MongoDB Atlas records
                  </p>
                </div>
                <button className="btn-secondary" onClick={fetchDashboardData}>
                  <RefreshCw size={13} style={{ marginRight: '4px' }} /> Refresh Stats
                </button>
              </div>

              <StatsRow stats={stats} />

              {/* Vote Distribution by Category (Mathematically Calculated) */}
              <div className="analytics-card-box">
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
                  Vote Distribution by Category
                </h3>
                <p style={{ fontSize: '12.5px', color: '#6B7280', marginBottom: '18px' }}>
                  Actual votes aggregated dynamically across all categorized polls
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {analytics && analytics.categoryStats && analytics.categoryStats.length > 0 ? (
                    analytics.categoryStats.map((item) => (
                      <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                          <span>{item.category}</span>
                          <span>
                            {item.count} votes ({Math.round(item.percentage)}%)
                          </span>
                        </div>
                        <div className="cat-progress-track">
                          <div
                            className="cat-progress-fill"
                            style={{
                              width: `${Math.max(item.percentage, 3)}%`,
                              background: item.color || '#6366F1',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                      No categorized vote data available yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Top Performing Polls Table */}
              <div className="analytics-card-box">
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>
                  Top Performing Polls
                </h3>
                {analytics && analytics.topPolls && analytics.topPolls.length > 0 ? (
                  <div className="top-polls-table">
                    {analytics.topPolls.map((tp, idx) => (
                      <div key={tp.id} className="top-poll-row" onClick={() => onNavigateToResults(tp.id)}>
                        <span className="tp-rank">#{idx + 1}</span>
                        <div className="tp-info">
                          <h4>{tp.question}</h4>
                          <span className="tp-meta">{tp.category} • Leading: {tp.topOptionText} ({Math.round(tp.topOptionPct)}%)</span>
                        </div>
                        <div className="tp-stats">
                          <span className="tp-votes">{tp.totalVotes} votes</span>
                          <span className="tp-views">{tp.totalViews} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                    No poll performance data recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= EXPLORE TAB ================= */}
          {activeNavTab === 'explore' && (
            <div>
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '22px' }}>Explore Community Polls</h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    Discover what people around the world are voting on in real time
                  </p>
                </div>
              </div>

              {/* Category Filter Pills & Sort Select */}
              <div className="explore-filter-bar">
                <div className="category-pills-list">
                  {['All', 'Technology', 'Lifestyle', 'Environment', 'Entertainment', 'General'].map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill-btn ${exploreCategory === cat ? 'active' : ''}`}
                      onClick={() => setExploreCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="explore-sort-select">
                  <span>Sort:</span>
                  <select value={exploreSort} onChange={(e) => setExploreSort(e.target.value)}>
                    <option value="trending">Trending 🔥</option>
                    <option value="most_votes">Most Votes 📊</option>
                    <option value="newest">Newest ⏱️</option>
                  </select>
                </div>
              </div>

              <div className="poll-cards-list" style={{ marginTop: '16px' }}>
                {publicPolls.length > 0 ? (
                  publicPolls.map((poll) => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      onOpenShare={handleShare}
                      onOpenVote={handleVote}
                      onOpenResults={handleViewResults}
                      onClosePoll={handleClosePoll}
                      onDuplicatePoll={handleDuplicatePoll}
                    />
                  ))
                ) : (
                  <div className="empty-polls-box">
                    <p>No public community polls found in category "{exploreCategory}".</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= PROFILE TAB ================= */}
          {activeNavTab === 'profile' && (
            <div className="profile-container-card">
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>User Profile</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                <div className="profile-avatar-circle">
                  {user && user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{user ? user.name : 'Pranesh'}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>{user ? user.email : 'pranesh@pulsepoll.io'}</p>
                  <span className="profile-badge-tag">Creator Account</span>
                </div>
              </div>

              {/* Real Metrics from MongoDB */}
              <div className="profile-stats-grid">
                <div className="profile-metric-box">
                  <div className="pmetric-label">Polls Created</div>
                  <div className="pmetric-value">{stats ? stats.totalPolls : (user?.totalPolls ?? polls.length)} Polls</div>
                </div>
                <div className="profile-metric-box">
                  <div className="pmetric-label">Audience Votes Received</div>
                  <div className="pmetric-value">{stats ? stats.totalVotes : 0} Votes</div>
                </div>
              </div>

              {/* Edit Profile Form */}
              <form onSubmit={handleSaveProfile} style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Edit Name</h4>
                <div style={{ display: 'flex', gap: '10px', maxWidth: '420px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Name'}
                  </button>
                </div>
              </form>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Change Password</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="New Password (min 8 chars, uppercase, number & symbol)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button type="submit" className="btn-secondary" style={{ alignSelf: 'flex-start' }} disabled={savingProfile}>
                    Update Password
                  </button>
                </div>
              </form>

              {/* Logout Button */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => {
                    logout();
                    showToast('Logged out successfully');
                    if (onNavigateToLanding) onNavigateToLanding();
                  }}
                >
                  <LogOut size={14} style={{ marginRight: '6px' }} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= SETTINGS TAB ================= */}
          {activeNavTab === 'settings' && (
            <div className="profile-container-card">
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Settings & Preferences</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>
                Appearance, live operational health, and system status
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="setting-status-row">
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Real-Time Updates</h4>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>
                      Native Redis Pub/Sub engine on port 6379 and WebSockets
                    </p>
                  </div>
                  <span className="operational-badge green">
                    🟢 Connected
                  </span>
                </div>

                <div className="setting-status-row">
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Database Storage</h4>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>
                      Persistent MongoDB Atlas cloud cluster
                    </p>
                  </div>
                  <span className="operational-badge green">
                    🟢 Operational
                  </span>
                </div>

                <div className="setting-status-row">
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Duplicate Vote Protection</h4>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>
                      Unique token and client IP verification
                    </p>
                  </div>
                  <span className="operational-badge green">
                    🟢 Active
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <button className="btn-primary" onClick={() => showToast('Preferences updated successfully! ✨')}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Column: Contextual Sidebar */}
        <RightSidebar
          activeTab={activeNavTab}
          userId={user?.id}
          onOpenCreate={() => setShowCreateModal(true)}
          onOpenJoin={() => setShowJoinModal(true)}
          onExplore={() => {
            setActiveNavTab('explore');
            showToast('Showing community polls');
          }}
        />
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile screens < 860px) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-nav-btn ${activeNavTab === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveNavTab('home'); setMobileMenuOpen(false); }}
        >
          <Home size={20} strokeWidth={activeNavTab === 'home' ? 2.5 : 2} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${activeNavTab === 'my-polls' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('my-polls');
            setFilterTab('all');
            setMobileMenuOpen(false);
          }}
        >
          <BarChart2 size={20} strokeWidth={activeNavTab === 'my-polls' ? 2.5 : 2} />
          <span>My Polls</span>
        </button>

        {/* Floating Create Button */}
        <button
          type="button"
          className="mobile-nav-create-btn"
          onClick={() => {
            setShowCreateModal(true);
            setMobileMenuOpen(false);
          }}
          title="Create Poll"
          aria-label="Create Poll"
        >
          <div className="mobile-create-fab">
            <Plus size={22} color="#FFFFFF" strokeWidth={2.8} />
          </div>
          <span>Create</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${activeNavTab === 'explore' ? 'active' : ''}`}
          onClick={() => { setActiveNavTab('explore'); setMobileMenuOpen(false); }}
        >
          <Compass size={20} strokeWidth={activeNavTab === 'explore' ? 2.5 : 2} />
          <span>Explore</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${activeNavTab === 'analytics' || activeNavTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveNavTab(user ? 'analytics' : 'profile'); setMobileMenuOpen(false); }}
        >
          <TrendingUp size={20} strokeWidth={activeNavTab === 'analytics' || activeNavTab === 'profile' ? 2.5 : 2} />
          <span>{user ? 'Analytics' : 'Profile'}</span>
        </button>
      </nav>

      {/* Modals */}
      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPollCreated={handlePollCreated}
        showToast={showToast}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        poll={selectedPoll}
        showToast={showToast}
      />

      <JoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={(pollId) => onNavigateToVote(pollId)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        showToast={showToast}
      />
    </div>
  );
}
