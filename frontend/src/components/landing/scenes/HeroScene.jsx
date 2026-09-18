import React from 'react';
import { ArrowRight, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import ScrollScene from '../motion/ScrollScene';
import Motion3DCard from '../motion/Motion3DCard';

export default function HeroScene({ onGetStarted, onExplore }) {
  return (
    <ScrollScene id="hero" className="scene-hero-stage" style={{ minHeight: '100vh', padding: 0 }}>
      {() => (
        <div className="hero-scene-container">
          {/* Background Photographic Image Layer - 100% Crisp & Visible on Both Sides */}
          <div className="hero-backdrop-layer">
            <img
              src="/assets/hero_traveler.jpg"
              alt="Scenic mountain landscape with traveler overlooking vast nature"
              className="hero-scenic-image"
            />
            <div className="hero-backdrop-gradient" />
          </div>

          {/* Main Hero Content Split (Left: Headline & CTAs, Right: Floating 3D Live Poll Card) */}
          <div className="hero-content-grid">
            {/* Left Column: Typography & Action Buttons */}
            <div className="hero-text-column">
              {/* Handwritten Note Annotation - Positioned cleanly above badge with zero overlap */}
              <div className="handwritten-note hero-note-pill">
                <span>Every opinion matters</span>
                <svg width="32" height="18" viewBox="0 0 50 30" fill="none" className="curved-arrow">
                  <path d="M5 5 C 20 25, 35 25, 45 10" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M40 8 L 46 10 L 44 16" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>

              <div className="hero-badge-pill">
                <Sparkles size={14} className="sparkle-icon" />
                <span>Real-Time Polling Platform</span>
              </div>

              <h1 className="hero-headline">
                Small Questions.<br />
                <span className="gradient-text-purple">Big Perspectives.</span>
              </h1>

              <p className="hero-subheading">
                Create live polls, share them anywhere, and watch responses update in real time.
              </p>

              <div className="hero-actions-row">
                <button className="btn-hero-primary" onClick={onGetStarted} id="hero-create-poll-btn">
                  <span>Create Your First Poll</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn-hero-secondary" onClick={onExplore} id="hero-explore-btn">
                  <span>Explore Polls</span>
                </button>
              </div>

              <div className="hero-trust-row">
                <div className="trust-item">
                  <CheckCircle2 size={15} color="#7C3AED" />
                  <span>Zero-refresh live updates</span>
                </div>
                <div className="trust-item">
                  <CheckCircle2 size={15} color="#7C3AED" />
                  <span>Redis Pub/Sub & WebSockets</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating 3D Live Poll UI Card with Scroll-driven Perspective */}
            <div className="hero-card-column">
              <Motion3DCard className="hero-poll-card" maxRotateX={16} maxTranslateZ={60}>
                <div className="hpc-header">
                  <div className="hpc-badge">
                    <span className="live-pulsing-dot" />
                    <span>LIVE POLLING</span>
                  </div>
                  <span className="hpc-votes-count">482 votes</span>
                </div>

                <h3 className="hpc-question">Which programming language do you prefer?</h3>

                <div className="hpc-options-list">
                  <div className="hpc-option-row highlight">
                    <div className="hpc-opt-info">
                      <span className="hpc-opt-name">Python</span>
                      <span className="hpc-opt-pct">48%</span>
                    </div>
                    <div className="hpc-opt-bar-track">
                      <div className="hpc-opt-bar-fill fill-python" style={{ width: '48%' }} />
                    </div>
                  </div>

                  <div className="hpc-option-row">
                    <div className="hpc-opt-info">
                      <span className="hpc-opt-name">Java</span>
                      <span className="hpc-opt-pct">27%</span>
                    </div>
                    <div className="hpc-opt-bar-track">
                      <div className="hpc-opt-bar-fill fill-java" style={{ width: '27%' }} />
                    </div>
                  </div>

                  <div className="hpc-option-row">
                    <div className="hpc-opt-info">
                      <span className="hpc-opt-name">Go</span>
                      <span className="hpc-opt-pct">18%</span>
                    </div>
                    <div className="hpc-opt-bar-track">
                      <div className="hpc-opt-bar-fill fill-go" style={{ width: '18%' }} />
                    </div>
                  </div>
                </div>

                <div className="hpc-footer">
                  <span className="hpc-footer-hint">Live synchronization active</span>
                  <span className="hpc-footer-tag">Redis Engine</span>
                </div>
              </Motion3DCard>
            </div>
          </div>

          {/* Subtle Scroll Indicator at bottom */}
          <div className="hero-scroll-hint">
            <span>Scroll to explore</span>
            <ChevronDown size={16} className="scroll-chevron" />
          </div>
        </div>
      )}
    </ScrollScene>
  );
}
