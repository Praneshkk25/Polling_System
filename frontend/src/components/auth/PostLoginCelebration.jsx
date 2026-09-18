import React, { useEffect, useState } from 'react';
import { Zap, Check, Sparkles, ShieldCheck, Database, Rocket } from 'lucide-react';

export default function PostLoginCelebration({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [expanding, setExpanding] = useState(false);

  const userName = user?.name || user?.email?.split('@')[0] || 'Creator';

  useEffect(() => {
    // Stage 1: Auth check
    const t1 = setTimeout(() => setStep(2), 500);
    // Stage 2: Redis Pub/Sub Sync
    const t2 = setTimeout(() => setStep(3), 1050);
    // Stage 3: Launch Portal Wipe
    const t3 = setTimeout(() => setExpanding(true), 1600);
    // Stage 4: Navigate to dashboard
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className={`post-login-portal-backdrop ${expanding ? 'portal-expand-out' : ''}`}>
      {/* Ambient background particles */}
      <div className="login-anim-particles">
        {[...Array(16)].map((_, i) => (
          <span
            key={i}
            className="anim-particle-spark"
            style={{
              left: `${10 + (i * 5.5) % 80}%`,
              top: `${15 + (i * 7.2) % 75}%`,
              animationDelay: `${(i * 0.12).toFixed(2)}s`,
              animationDuration: `${1.6 + (i % 3) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Central 3D Holographic Capsule */}
      <div className="login-portal-card">
        {/* Orbiting Cyber Rings */}
        <div className="portal-ring-orbit ring-outer" />
        <div className="portal-ring-orbit ring-inner" />

        {/* Central Glowing Badge */}
        <div className="portal-badge-glow">
          <div className="portal-icon-center">
            <Zap size={36} color="#FFFFFF" className="portal-bolt-icon" />
          </div>
        </div>

        <div className="portal-welcome-text">
          <div className="portal-sparkle-pill">
            <Sparkles size={13} />
            <span>SESSION AUTHENTICATED</span>
          </div>
          <h2 className="portal-welcome-title">
            Welcome back, <span className="gradient-portal-name">{userName}</span>!
          </h2>
          <p className="portal-welcome-sub">Initializing your real-time polling studio...</p>
        </div>

        {/* Sequential Protocol Handshake */}
        <div className="portal-sync-steps">
          <div className={`portal-step-row ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="step-status-icon">
              {step > 1 ? <Check size={12} color="#10B981" /> : <ShieldCheck size={14} color="#7C3AED" />}
            </div>
            <span className="step-name">JWT Session Signature Verified</span>
          </div>

          <div className={`portal-step-row ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <div className="step-status-icon">
              {step > 2 ? <Check size={12} color="#10B981" /> : <Database size={14} color="#7C3AED" />}
            </div>
            <span className="step-name">Redis Pub/Sub WebSocket Stream Connected</span>
          </div>

          <div className={`portal-step-row ${step >= 3 ? 'active' : ''}`}>
            <div className="step-status-icon">
              <Rocket size={14} color="#F59E0B" className="rocket-bounce" />
            </div>
            <span className="step-name">Entering Creator Dashboard...</span>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="portal-progress-bar-track">
          <div
            className="portal-progress-bar-fill"
            style={{
              width: step === 1 ? '35%' : step === 2 ? '75%' : '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
