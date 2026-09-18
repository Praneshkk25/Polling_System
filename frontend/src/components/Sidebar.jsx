import React from 'react';
import {
  Home, BarChart2, PlusSquare, TrendingUp, Compass, User, Settings, Plus,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenCreate, collapsed, onToggleCollapse }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-polls', label: 'My Polls', icon: BarChart2 },
    { id: 'create', label: 'Create Poll', icon: PlusSquare, action: onOpenCreate },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`left-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top-section">
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                <div className="nav-icon-box">
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </div>
                {!collapsed && <span className="nav-label-text">{item.label}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Promo Card or Mini Icon when Collapsed */}
      <div className="sidebar-bottom-section">
        {!collapsed ? (
          <div className="sidebar-promo-card">
            <div className="promo-badge-graphic"></div>
            <h3>Turn Opinions into Insights</h3>
            <p>Create. Share. Engage. See results live.</p>
            <button className="btn-sidebar-create" onClick={onOpenCreate}>
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

        {/* Bottom Mini Toggle Button */}
        {onToggleCollapse && (
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
  );
}
