import React, { useState } from 'react';
import {
  Activity, Search, Bell, ChevronDown, LogOut, UserPlus, Check,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  onOpenCreate,
  onOpenAuth,
  onSearch,
  searchQuery,
  onNavigateToLanding,
  sidebarCollapsed,
  onToggleSidebar,
  mobileMenuOpen,
}) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="top-navbar">
      {/* Brand & Sidebar Toggle Group */}
      <div className="nav-brand-group">
        {onToggleSidebar && (
          <button
            type="button"
            className={`sidebar-toggle-btn ${mobileMenuOpen ? 'mobile-active' : ''}`}
            onClick={onToggleSidebar}
            title={mobileMenuOpen || !sidebarCollapsed ? "Collapse Sidebar" : "Expand Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {mobileMenuOpen || !sidebarCollapsed ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
          </button>
        )}

        <div
          className="brand-wrapper interactive-brand"
          onClick={() => {
            if (onNavigateToLanding) onNavigateToLanding();
            else window.location.hash = '#/landing';
          }}
          title="Go to PulsePoll Landing Page"
        >
          <div className="brand-icon">
            <Activity size={22} strokeWidth={2.6} />
          </div>
          <div className="brand-text">
            <h1>PulsePoll</h1>
            <span>Ideas in Real Time</span>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="nav-search-box">
        <Search size={16} color="#9CA3AF" />
        <input
          type="text"
          placeholder="Search polls, topics or people..."
          value={searchQuery}
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
        <span className="search-shortcut">⌘ K</span>
      </div>

      {/* Right Controls */}
      <div className="nav-right-actions">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="notif-btn"
            title="Notifications"
            onClick={() => setShowNotif(!showNotif)}
          >
            <Bell size={18} />
            <span className="notif-badge"></span>
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              width: '290px',
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '14px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              zIndex: 100,
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Recent Notifications</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                <div style={{ padding: '8px', background: '#F9FAFB', borderRadius: '8px' }}>
                  🎉 <strong>Sarah</strong> voted on <em>"Which programming language...?"</em>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>2 minutes ago</div>
                </div>
                <div style={{ padding: '8px', background: '#F9FAFB', borderRadius: '8px' }}>
                  🚀 Your poll reached <strong>480+ total votes</strong>!
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>15 minutes ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-pill"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="user-info">
              <span className="user-name">{user ? user.name : 'Guest'}</span>
              <span className="user-role">{user ? user.role || 'Creator' : 'Sign in'}</span>
            </div>
            <ChevronDown size={14} color="#6B7280" />
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              width: '210px',
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '8px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              zIndex: 100,
            }}>
              {user ? (
                <>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{user.email}</div>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); onOpenCreate(); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '8px',
                      marginTop: '4px',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    + Create New Poll
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#DC2626',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#FEE2E2'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenAuth(); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#111827',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <UserPlus size={14} /> Login / Signup
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
