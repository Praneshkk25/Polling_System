import React from 'react';
import { Zap, ShieldCheck, Heart, Smartphone } from 'lucide-react';
import ScrollScene from '../motion/ScrollScene';
import FloatingCard from '../motion/FloatingCard';

export default function WhyPulsePollScene() {
  return (
    <ScrollScene id="features" className="scene-features-stage">
      {() => (
        <div className="scene-container features-scene-container">
          <div className="scene-ambient-glow glow-lavender" />

          {/* Header */}
          <div className="scene-text-header">
            <div className="scene-step-tag">05 / WHY PULSEPOLL</div>
            <h2 className="scene-headline">
              Built for every <span className="gradient-text-purple">conversation.</span>
            </h2>
            <p className="scene-subheading">
              Simple. Powerful. Real-time. Built specifically for modern high-engagement teams, lectures, and live events.
            </p>
          </div>

          {/* 2x2 Feature Cards Grid */}
          <div className="features-quad-grid">
            {/* Card 1 */}
            <div className="quad-card-cell cell-1">
              <FloatingCard maxTilt={5} className="feature-quad-card">
                <div className="fqc-icon-badge icon-zap">
                  <Zap size={22} color="#7C3AED" />
                </div>
                <h3 className="fqc-title">REAL-TIME UPDATES</h3>
                <p className="fqc-desc">
                  Powered by native Redis Pub/Sub and bidirectional WebSockets for sub-millisecond, zero-refresh live synchronization.
                </p>
                <span className="fqc-footer-tag">Under 20ms Latency</span>
              </FloatingCard>
            </div>

            {/* Card 2 */}
            <div className="quad-card-cell cell-2">
              <FloatingCard maxTilt={5} className="feature-quad-card">
                <div className="fqc-icon-badge icon-shield">
                  <ShieldCheck size={22} color="#059669" />
                </div>
                <h3 className="fqc-title">SECURE & RELIABLE</h3>
                <p className="fqc-desc">
                  Persistent, durable data storage with MongoDB Atlas. Enforces client-fingerprint and session duplicate-vote prevention.
                </p>
                <span className="fqc-footer-tag">Atomic Persistence</span>
              </FloatingCard>
            </div>

            {/* Card 3 */}
            <div className="quad-card-cell cell-3">
              <FloatingCard maxTilt={5} className="feature-quad-card">
                <div className="fqc-icon-badge icon-heart">
                  <Heart size={22} color="#E11D48" />
                </div>
                <h3 className="fqc-title">BEAUTIFUL EXPERIENCE</h3>
                <p className="fqc-desc">
                  Tailored light SaaS design with glassmorphic depth, smooth micro-animations, and instant audio-visual celebration feedback.
                </p>
                <span className="fqc-footer-tag">Crafted for Engagement</span>
              </FloatingCard>
            </div>

            {/* Card 4 */}
            <div className="quad-card-cell cell-4">
              <FloatingCard maxTilt={5} className="feature-quad-card">
                <div className="fqc-icon-badge icon-phone">
                  <Smartphone size={22} color="#2563EB" />
                </div>
                <h3 className="fqc-title">USE IT ANYWHERE</h3>
                <p className="fqc-desc">
                  Responsive on desktop, tablet, and mobile browsers. No app download or account creation required for voters.
                </p>
                <span className="fqc-footer-tag">Frictionless Participation</span>
              </FloatingCard>
            </div>
          </div>

          {/* Handwritten note */}
          <div className="handwritten-note features-note">
            <span>A more connected world starts with a question.</span>
          </div>
        </div>
      )}
    </ScrollScene>
  );
}
