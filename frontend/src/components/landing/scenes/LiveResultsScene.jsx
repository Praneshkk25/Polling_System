import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import ScrollScene from '../motion/ScrollScene';
import Motion3DCard from '../motion/Motion3DCard';
import AnimatedProgressBar from '../motion/AnimatedProgressBar';

export default function LiveResultsScene() {
  const [liveVote, setLiveVote] = useState({
    python: 48,
    votes: 232,
    total: 483,
    isPlusOne: true,
  });

  const voters = [
    { id: 1, name: 'Alex K.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', choice: 'Python' },
    { id: 2, name: 'Marcus D.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', choice: 'Go' },
    { id: 3, name: 'Priya S.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80', choice: 'Python' },
    { id: 4, name: 'Liam W.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', choice: 'Java' },
  ];

  return (
    <ScrollScene id="live" className="scene-live-results-stage">
      {() => (
        <div className="scene-container live-results-container">
          <div className="scene-ambient-glow glow-purple-strong" />

          {/* Header */}
          <div className="scene-text-header">
            <div className="scene-step-tag">03 / SEE RESULTS</div>
            <h2 className="scene-headline">
              Watch opinions <span className="gradient-text-purple">change — live.</span>
            </h2>
            <p className="scene-subheading">
              See results update instantly as votes come in. No refresh needed. Powered by native Redis Pub/Sub event broadcasting and WebSocket client push.
            </p>
          </div>

          {/* Central Dashboard Frame */}
          <div className="live-dashboard-frame-wrap">
            {/* Floating Participant Avatars around card */}
            <div className="participant-bubbles-cloud">
              {voters.map((v, i) => (
                <div
                  key={v.id}
                  className={`voter-bubble bubble-pos-${i + 1}`}
                  title={`${v.name} voted for ${v.choice}`}
                >
                  <img src={v.avatar} alt={v.name} className="voter-bubble-avatar" />
                  <span className="voter-bubble-badge">{v.choice}</span>
                </div>
              ))}
            </div>

            {/* Real-time Results Card */}
            <Motion3DCard className="live-results-board" maxRotateX={16} maxTranslateZ={60} scaleBoost={0.08}>
              <div className="lrb-header">
                <div className="lrb-title-group">
                  <span className="lrb-title">Real-time Results</span>
                  <span className="lrb-subtitle">Which programming language do you prefer?</span>
                </div>
                <div className="lrb-badge-live">
                  <span className="live-pulsing-dot" />
                  <span>LIVE</span>
                </div>
              </div>

              <div className="lrb-bars-list">
                {/* Option 1: Python */}
                <div className="lrb-bar-item highlight-pulse">
                  <div className="lrb-item-meta">
                    <div className="lrb-opt-title">
                      <span className="lrb-opt-bullet">1.</span>
                      <span className="lrb-opt-name">Python</span>
                      <span className="lrb-vote-ping">+1 new vote</span>
                    </div>
                    <span className="lrb-opt-pct">48%</span>
                  </div>
                  <AnimatedProgressBar percentage={48} color="#7C3AED" height={9} />
                </div>

                {/* Option 2: Java */}
                <div className="lrb-bar-item">
                  <div className="lrb-item-meta">
                    <div className="lrb-opt-title">
                      <span className="lrb-opt-bullet">2.</span>
                      <span className="lrb-opt-name">Java</span>
                    </div>
                    <span className="lrb-opt-pct">27%</span>
                  </div>
                  <AnimatedProgressBar percentage={27} color="#8B5CF6" height={9} />
                </div>

                {/* Option 3: Go */}
                <div className="lrb-bar-item">
                  <div className="lrb-item-meta">
                    <div className="lrb-opt-title">
                      <span className="lrb-opt-bullet">3.</span>
                      <span className="lrb-opt-name">Go</span>
                    </div>
                    <span className="lrb-opt-pct">18%</span>
                  </div>
                  <AnimatedProgressBar percentage={18} color="#A78BFA" height={9} />
                </div>

                {/* Option 4: JavaScript */}
                <div className="lrb-bar-item">
                  <div className="lrb-item-meta">
                    <div className="lrb-opt-title">
                      <span className="lrb-opt-bullet">4.</span>
                      <span className="lrb-opt-name">JavaScript</span>
                    </div>
                    <span className="lrb-opt-pct">7%</span>
                  </div>
                  <AnimatedProgressBar percentage={7} color="#C4B5FD" height={9} />
                </div>
              </div>

              {/* Footer with Total Vote Counter */}
              <div className="lrb-footer">
                <div className="lrb-total-votes">
                  <span className="votes-count-val">{liveVote.total}</span>
                  <span className="votes-count-label">total votes recorded</span>
                </div>
                <div className="lrb-channel-indicator">
                  <Zap size={14} color="#10B981" />
                  <span>Sub-millisecond Redis Pub/Sub stream</span>
                </div>
              </div>
            </Motion3DCard>

            {/* Floating +1 Vote Notification Banner */}
            <div className="live-plus-one-toast">
              <div className="toast-avatar-row">
                <img src={voters[0].avatar} alt="Voter" className="toast-img" />
                <div className="toast-text">
                  <strong>+1 new vote for Python</strong>
                  <span>Just now via WebSocket</span>
                </div>
              </div>
            </div>

            {/* Handwritten Note */}
            <div className="handwritten-note live-note">
              <span>Live updates. No refresh. Just real-time.</span>
            </div>
          </div>
        </div>
      )}
    </ScrollScene>
  );
}
