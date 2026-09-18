import React from 'react';
import { ArrowRight, Send, ArrowUp, Zap } from 'lucide-react';
import ScrollScene from '../motion/ScrollScene';

export default function FinalCTAScene({ onGetStarted, onExplore, onSignIn }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ScrollScene id="cta" className="scene-final-cta-stage" style={{ paddingBottom: '0' }}>
      {() => (
        <div className="scene-container cta-final-container">
          <div className="cta-backdrop-glow" />

          <div className="cta-content-card">
            <div className="scene-step-tag">07 / GET STARTED</div>
            <h2 className="cta-headline">
              Every vote adds<br />
              <span className="gradient-text-purple">a new perspective.</span>
            </h2>
            <p className="cta-subheading">
              Join PulsePoll and be part of more meaningful conversations. Create your first live poll in seconds.
            </p>

            <div className="cta-buttons-row">
              <button className="btn-hero-primary" onClick={onGetStarted} id="cta-create-poll-btn">
                <span>Create Your First Poll</span>
                <ArrowRight size={16} />
              </button>
              <button className="btn-hero-secondary" onClick={onExplore} id="cta-explore-btn">
                <span>Explore Public Polls</span>
              </button>
            </div>

            {/* Handwritten Note: "Ideas don't have borders." with floating paper airplane */}
            <div className="handwritten-note cta-note">
              <span>Ideas don't have borders.</span>
              <Send size={18} color="#7C3AED" className="paper-plane-icon" />
            </div>

            {/* Scenic Cliff Photography Showcase */}
            <div className="cta-photo-frame">
              <img
                src="/assets/final_cta_cliff.jpg"
                alt="Traveler sitting on scenic cliff looking at sunset"
                className="cta-photo-img"
              />
              <div className="cta-photo-gradient" />
            </div>

            {/* Scroll Back To Top Button */}
            <div className="scroll-top-wrap" onClick={scrollToTop}>
              <span>Scroll to top</span>
              <ArrowUp size={14} />
            </div>
          </div>

          {/* Clean Light Footer */}
          <footer className="landing-footer">
            <div className="footer-inner">
              <div className="footer-brand">
                <div className="brand-logo-icon mini">
                  <Zap size={14} color="#7C3AED" />
                </div>
                <span>PulsePoll © 2026 — Real-Time Polling Platform</span>
              </div>
              <div className="footer-links">
                <button className="footer-link-btn" onClick={onSignIn}>Sign In</button>
                <button className="footer-link-btn" onClick={onGetStarted}>Create Poll</button>
                <button className="footer-link-btn" onClick={onExplore}>Community Polls</button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </ScrollScene>
  );
}
