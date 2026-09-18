import React from 'react';
import {
  Home, BarChart2, PlusSquare, TrendingUp, Compass, User, Settings, Plus,
  ChevronLeft, ChevronRight, X, Activity
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenCreate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-polls', label: 'My Polls', icon: BarChart2 },
    { id: 'create', label: 'Create Poll', icon: PlusSquare, action: onOpenCreate },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // In mobile slide-out drawer, never show collapsed rail mode
  const isRailCollapsed = collapsed && !mobileOpen;

  const handleItemClick = (item) => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`left-sidebar ${isRailCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Mobile Header with Close Button */}
        {mobileOpen && (
          <div className="mobile-drawer-header">
            <div className="mobile-drawer-brand">
              <div className="drawer-brand-icon">
                <Activity size={18} strokeWidth={2.6} />
              </div>
              <span className="drawer-brand-title">PulsePoll</span>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="sidebar-top-section">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  title={isRailCollapsed ? item.label : undefined}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="nav-icon-box">
                    <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                  </div>
                  {!isRailCollapsed && <span className="nav-label-text">{item.label}</span>}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Promo Card or Mini Icon when Collapsed */}
        <div className="sidebar-bottom-section">
          {!isRailCollapsed ? (
            <div className="sidebar-promo-card">
              <div className="promo-badge-graphic"></div>
              <h3>Turn Opinions into Insights</h3>
              <p>Create. Share. Engage. See results live.</p>
              <button
                className="btn-sidebar-create"
                onClick={() => {
                  if (mobileOpen && onCloseMobile) onCloseMobile();
                  onOpenCreate();
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Create Poll</span>
              </button>
            </div>
          ) : (
            <div className="sidebar-mini-actions">
              <button
                className="mini-create-btn"
                onClick={onOpenCreate}
                title="Create New Poll"
              >
                <Plus size={18} strokeWidth={2.6} />
              </button>
            </div>
          )}

          {/* Desktop Rail Collapse Toggle (hidden on mobile) */}
          {!mobileOpen && onToggleCollapse && (
            <button
              type="button"
              className="sidebar-rail-collapse-btn"
              onClick={onToggleCollapse}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!collapsed && <span>Collapse Sidebar</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

