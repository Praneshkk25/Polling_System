import React from 'react';
import { Users } from 'lucide-react';
import ScrollScene from '../motion/ScrollScene';
import Motion3DCard from '../motion/Motion3DCard';

export default function RealTimeMomentScene() {
  const participants = [
    { id: 'top-left', name: 'Devin M.', role: 'Frontend Engineer', vote: 'Python', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', x: -180, y: -120 },
    { id: 'top-right', name: 'Sophia L.', role: 'Data Scientist', vote: 'Python', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80', x: 180, y: -120 },
    { id: 'bottom-left', name: 'Kenji T.', role: 'Backend Dev', vote: 'Go', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', x: -190, y: 110 },
    { id: 'bottom-right', name: 'Elena R.', role: 'Product Manager', vote: 'Java', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80', x: 190, y: 110 },
  ];

  return (
    <ScrollScene id="realtime-moment" className="scene-realtime-stage">
      {() => (
        <div className="scene-container realtime-moment-container">
          <div className="scene-ambient-glow glow-indigo" />

          {/* Header */}
          <div className="scene-text-header">
            <div className="scene-step-tag">04 / THE REAL-TIME ENGINE</div>
            <h2 className="scene-headline">
              People are voting in <span className="gradient-text-purple">real time.</span>
            </h2>
            <p className="scene-subheading">
              Multiple browsers. Same poll. Same millisecond. Whether an audience of 10 or 10,000, updates flow instantly without server bottlenecks.
            </p>
          </div>

          {/* Radial Connection Hub Stage */}
          <div className="realtime-hub-stage">
            {/* SVG Connecting Ray Lines */}
            <svg className="radial-rays-svg" viewBox="-250 -180 500 360">
              <line x1="-160" y1="-90" x2="-70" y2="-30" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="160" y1="-90" x2="70" y2="-30" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="-160" y1="90" x2="-70" y2="30" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="160" y1="90" x2="70" y2="30" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Central LIVE POLL Card */}
            <Motion3DCard className="radial-central-poll" maxRotateX={14} maxTranslateZ={50}>
              <div className="rcp-badge">
                <span className="live-pulsing-dot" />
                <span>CONCURRENT SYNC</span>
              </div>
              <h4 className="rcp-title">Live Poll Stream</h4>
              <div className="rcp-metric-row">
                <span className="rcp-counter">485</span>
                <span className="rcp-label">synced votes</span>
              </div>
              <div className="rcp-feed-tags">
                <span className="rcp-feed-pill">Redis Pub/Sub</span>
                <span className="rcp-feed-pill">WebSockets</span>
              </div>
            </Motion3DCard>

            {/* Surrounding Connected Voters */}
            {participants.map((p) => (
              <div
                key={p.id}
                className={`participant-radial-node node-${p.id}`}
                style={{
                  transform: `translate3d(${p.x}px, ${p.y}px, 0)`,
                }}
              >
                <div className="node-avatar-wrap">
                  <img src={p.avatar} alt={p.name} className="node-avatar-img" />
                  <div className="node-pulse-ring" />
                </div>
                <div className="node-info-card">
                  <div className="node-name">{p.name}</div>
                  <div className="node-role">{p.role}</div>
                  <div className="node-vote-pill">
                    <span>+1 vote: {p.vote}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Proof Metric Pill */}
          <div className="realtime-proof-banner">
            <Users size={16} color="#7C3AED" />
            <span>People are voting in real time across different devices and continents</span>
          </div>
        </div>
      )}
    </ScrollScene>
  );
}
