import React from 'react';
import { Plus, Users, Sparkles } from 'lucide-react';
import Button from './ui/Button';

export default function HeroBanner({ onOpenCreate }) {
  return (
    <div className="hero-banner animated-hero">
      <div className="hero-left">
        <h2 className="hero-title">
          Small Questions.<br />
          <span className="gradient-text">Big Perspectives.</span>
        </h2>
        <p className="hero-subtitle">
          Create live polls, share with anyone, and watch the world respond in real time.
        </p>

        <div className="hero-cta-group">
          <Button
            variant="hero"
            size="md"
            iconLeft={Plus}
            onClick={onOpenCreate}
          >
            Create Your First Poll
          </Button>
          <div className="hero-free-badge">
            <svg width="28" height="18" viewBox="0 0 32 20" fill="none" style={{ transform: 'rotate(-5deg)' }}>
              <path d="M2 14C10 16 18 10 28 4M28 4L22 2M28 4L27 10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>It's free!</span>
          </div>
        </div>
      </div>

      {/* Hero 3D Graphic Avatars & Dynamic Emojis */}
      <div className="hero-illustration">
        <div style={{ position: 'relative', width: '280px', height: '170px' }}>
          {/* Floating Live Tag */}
          <div className="floating-pill-tag hero-motion-pill">
            <span style={{ color: '#059669', marginRight: '4px' }}>●</span> Real time
          </div>

          {/* Floating Emoji Badges */}
          <div className="hero-motion-emoji" style={{
            position: 'absolute',
            top: '20px',
            left: '10px',
            background: '#FFFFFF',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            fontSize: '18px',
            cursor: 'pointer',
          }}>
            😊
          </div>

          <div className="hero-motion-metric" style={{
            position: 'absolute',
            top: '10px',
            right: '40px',
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '6px 8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#4F46E5',
          }}>
            📊 84%
          </div>

          {/* Character Avatars Illustration Cluster */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
          }}>
            {/* Avatar 1 */}
            <div style={{
              width: '64px',
              height: '84px',
              borderRadius: '24px 24px 8px 8px',
              background: 'linear-gradient(180deg, #60A5FA 0%, #2563EB 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)',
              position: 'relative',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#FED7AA',
                marginBottom: '4px',
                border: '2px solid #FFFFFF',
              }}></div>
              <span style={{ fontSize: '11px' }}>📱</span>
            </div>

            {/* Avatar 2 (Center Girl) */}
            <div style={{
              width: '76px',
              height: '104px',
              borderRadius: '28px 28px 10px 10px',
              background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(219, 39, 119, 0.25)',
              zIndex: 2,
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#FDE68A',
                marginBottom: '6px',
                border: '2px solid #FFFFFF',
              }}></div>
              <span style={{ fontSize: '13px' }}>✨</span>
            </div>

            {/* Avatar 3 */}
            <div style={{
              width: '64px',
              height: '88px',
              borderRadius: '24px 24px 8px 8px',
              background: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.25)',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#FBCFE8',
                marginBottom: '4px',
                border: '2px solid #FFFFFF',
              }}></div>
              <span style={{ fontSize: '11px' }}>🗳️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
