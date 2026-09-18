import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { useGlobalScrollProgress } from './motion/useScrollProgress';
import { useAuth } from '../../context/AuthContext';

export default function LandingNavbar({ onGetStarted, onSignIn, onExplore }) {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const globalProgress = useGlobalScrollProgress();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Ultra-Minimal Top Scroll Progress Indicator */}
      <div className="landing-top-progress-track">
        <div
          className="landing-top-progress-bar"
          style={{ width: `${(globalProgress * 100).toFixed(1)}%` }}
        />
      </div>

      {/* Floating Dynamic Navbar */}
      <header className={`landing-header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="landing-nav-container">
          {/* Brand Logo */}
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-logo-icon">
              <Zap size={20} color="#7C3AED" />
            </div>
            <div className="brand-text-group">
              <span className="brand-name">PulsePoll</span>
              <span className="brand-tagline">Ideas in Real Time</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="landing-nav-links">
            <button className="nav-link" onClick={() => scrollToSection('create')}>
              How It Works
            </button>
            <button className="nav-link" onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button className="nav-link" onClick={() => scrollToSection('realtime-moment')}>
              Engine
            </button>
            <button className="nav-link" onClick={onExplore}>
              Explore
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="landing-nav-actions">
            {user ? (
              <button className="btn-nav-getstarted" onClick={onGetStarted} id="nav-get-started-btn">
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button className="btn-nav-signin" onClick={onSignIn} id="nav-sign-in-btn">
                  Sign In
                </button>
                <button className="btn-nav-getstarted" onClick={onGetStarted} id="nav-get-started-btn">
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
