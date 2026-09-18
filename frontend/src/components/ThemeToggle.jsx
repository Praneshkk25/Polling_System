import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'dropdown' }) {
  const { themeMode, effectiveTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  // Active Icon to show on trigger button
  const TriggerIcon = themeMode === 'dark' ? Moon : themeMode === 'light' ? Sun : Laptop;

  if (variant === 'segmented') {
    return (
      <div className="theme-segmented-group">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = themeMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`theme-segment-btn ${isSelected ? 'active' : ''}`}
              onClick={() => setTheme(opt.id)}
            >
              <Icon size={15} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="theme-toggle-wrap" ref={menuRef}>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setOpen(!open)}
        title={`Theme: ${themeMode} (${effectiveTheme})`}
        aria-label="Toggle Theme"
      >
        <TriggerIcon size={17} strokeWidth={2.2} />
      </button>

      {open && (
        <div className="theme-dropdown-menu">
          <div className="theme-dropdown-header">
            <span>Theme Preference</span>
          </div>

          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setTheme(opt.id);
                  setOpen(false);
                }}
              >
                <div className="theme-option-left">
                  <Icon size={15} className="theme-opt-icon" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} className="theme-check-icon" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
