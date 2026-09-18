import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ChevronDown,
  MessageCircle,
  Send,
  Users,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useScrollProgress, interpolate } from './motion/useScrollProgress';
import { useMouseTilt } from './motion/useMouseTilt';

export default function CinematicHeroExperience({ onGetStarted, onExplore }) {
  const containerRef = useRef(null);
  const progress = useScrollProgress(containerRef);
  const [copied, setCopied] = useState(false);
  const [selectedLearn, setSelectedLearn] = useState('projects');
  const { tilt, onMouseMove, onMouseLeave } = useMouseTilt(6);

  const pollUrl = 'https://pulsepoll.io/p/8X29K';

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // =========================================================================
  // SCROLL-DRIVEN 3D MOTION CHOREOGRAPHY (Inspired by Video-35008.mp4)
  // Total Scroll Range: 0.00 -> 1.00 across a 320vh track
  //
  // Act 1: 0.00 -> 0.25  Hero 2-column layout. Left text glides away.
  //                      Right 3D card moves to center and zooms forward.
  // Act 2: 0.25 -> 0.50  Card morphs into Ask Anything question + cascading options.
  // Act 3: 0.50 -> 0.75  Card 3D tilts and morphs into Share Interface + Smartphone.
  // Act 4: 0.75 -> 1.00  Card expands into Live Results Visualizer with growing bars.
  // =========================================================================

  // 1. Background Photography Parallax
  const bgScale = interpolate(progress, [0, 1], [1.0, 1.10]);
  const bgTranslateY = interpolate(progress, [0, 1], [0, -30]);

  // 2. Hero Headline Card (Positioned on the RIGHT, opposite to the person)
  // Glides upward and fades as user scrolls
  const heroTextOpacity = interpolate(progress, [0, 0.15], [1, 0]);
  const heroTextTranslateY = interpolate(progress, [0, 0.15], [0, -50]);

  // 3. Central 3D Card (Hidden at start, enters centered during scroll)
  const cardOpacity = interpolate(progress, [0.12, 0.20], [0, 1]);
  const cardTranslateY = interpolate(progress, [0.12, 0.20], [45, 0]);
  const cardRotY = interpolate(progress, [0.15, 0.40, 0.65, 0.85, 1.0], [4, -5, 6, -2, 0]);
  const cardRotX = interpolate(progress, [0.15, 0.40, 0.70, 1.0], [3, -2, 2, 0]);
  const cardDepthZ = interpolate(progress, [0.15, 0.45, 0.75, 1.0], [10, 60, 80, 40]);
  const cardScale = interpolate(progress, [0.12, 0.24, 0.75, 1.0], [0.92, 1.04, 1.06, 1.01]);

  // 4. Discrete Scroll Stages:
  // progress < 0.16: Starting Hero (Traveler on Left, Hero Text on Right, NO card)
  // 0.16 <= progress < 0.48: Act 1 / CREATE (Question Builder)
  // 0.48 <= progress < 0.74: Act 2 / SHARE (Share Link + QR + Phone Mockup)
  // progress >= 0.74: Act 3 / LIVE POLLING (Live Polling Card with dynamic sync)
  let activeStage = 0;
  let actBadge = '';
  let actTitle = '';
  let actSub = '';

  if (progress >= 0.74) {
    activeStage = 3;
    actBadge = '03 / LIVE RESULTS';
    actTitle = 'Watch opinions change — live.';
    actSub = 'Powered by native Redis Pub/Sub events and WebSocket client push.';
  } else if (progress >= 0.48) {
    activeStage = 2;
    actBadge = '02 / SHARE';
    actTitle = 'Share it anywhere with one link or QR code.';
    actSub = 'Audience votes directly on mobile or desktop with zero app downloads.';
  } else if (progress >= 0.16) {
    activeStage = 1;
    actBadge = '01 / CREATE';
    actTitle = 'Ask anything. Turn questions into conversations.';
    actSub = 'From team standups to classroom discussions, collect real feedback instantly.';
  }

  // Act 2 Smartphone Mockup Entrance
  const phoneTranslateY = interpolate(progress, [0.48, 0.58, 0.70, 0.74], [90, 0, 0, 80]);
  const phoneOpacity = interpolate(progress, [0.48, 0.54, 0.70, 0.74], [0, 1, 1, 0]);

  // Act 3 Live Results Dynamic Bar Growth & Synced Votes
  const barPython = Math.round(interpolate(progress, [0.74, 0.88], [24, 48]));
  const barJava = Math.round(interpolate(progress, [0.75, 0.89], [15, 27]));
  const barGo = Math.round(interpolate(progress, [0.76, 0.90], [8, 18]));
  const votesCount = Math.round(interpolate(progress, [0.74, 0.92], [420, 482]));

  // Options for Act 1 Question Builder
  const options = [
    { id: 'videos', label: 'Interactive Videos', icon: '🎥' },
    { id: 'books', label: 'Books & Documentation', icon: '📚' },
    { id: 'projects', label: 'Real-world Projects', icon: '💻' },
    { id: 'courses', label: 'Structured Courses', icon: '🎓' },
  ];

  return (
    <div
      ref={containerRef}
      className="cinematic-hero-track"
      style={{ height: '320vh', position: 'relative' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Sticky Viewport: Remains pinned for the 320vh duration */}
      <div className="cinematic-sticky-stage">
        {/* Background Landscape: Traveler anchored on Left, open sky on Right */}
        <div
          className="che-backdrop-wrap"
          style={{
            transform: `translate3d(0, ${bgTranslateY}px, 0) scale(${bgScale})`,
            transition: 'transform 0.08s ease-out',
          }}
        >
          <img
            src="/assets/hero_traveler.jpg"
            alt="Scenic mountain landscape"
            className="che-backdrop-img"
          />
          <div className="che-backdrop-overlay" />
        </div>

        {/* Main Content Layout Grid: Everything positioned on the RIGHT, opposite traveler on Left */}
        <div className="che-content-grid">
          {/* Starting Screen: Frosted Text Card on the RIGHT (Opposite to person on Left) */}
          {heroTextOpacity > 0.01 && (
            <div
              className="che-hero-text-col"
              style={{
                opacity: heroTextOpacity,
                transform: `translate3d(0, ${heroTextTranslateY}px, 0)`,
                pointerEvents: progress > 0.14 ? 'none' : 'auto',
                transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
              }}
            >
              <div className="handwritten-note hero-note-pill">
                <span>Every opinion matters</span>
                <svg width="32" height="18" viewBox="0 0 50 30" fill="none" className="curved-arrow">
                  <path d="M5 5 C 20 25, 35 25, 45 10" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M40 8 L 46 10 L 44 16" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
                Create live polls, share them anywhere, and watch responses update in real time without page refreshing.
              </p>

              <div className="hero-actions-row">
                <button className="btn-hero-primary" onClick={onGetStarted} id="che-start-btn">
                  <span>Create Your First Poll</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn-hero-secondary" onClick={onExplore} id="che-explore-btn">
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
          )}

          {/* Scrolling Content: ALL ON THE RIGHT (Opposite traveler on Left) */}
          {cardOpacity > 0.02 && activeStage > 0 && (
            <div
              className="che-scroll-stage-col"
              style={{
                opacity: cardOpacity,
                transform: `translate3d(0, ${cardTranslateY}px, 0)`,
                transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
                pointerEvents: 'auto',
              }}
            >
              {/* Header: Badge pill, title and subtitle strictly aligned on the right */}
              <div className="che-right-stage-header">
                <div className="che-stage-pill">
                  <span className="live-pulsing-dot" />
                  <span>{actBadge}</span>
                </div>
                <h2 className="che-right-stage-title">{actTitle}</h2>
                <p className="che-right-stage-sub">{actSub}</p>
              </div>

              {/* 3D Morphing Card Container on the Right */}
              <div
                className="che-morph-card-wrapper"
                style={{
                  transform: `perspective(1200px) translate3d(0, 0, ${cardDepthZ}px) scale(${cardScale}) rotateX(${cardRotX + tilt.x}deg) rotateY(${cardRotY + tilt.y}deg)`,
                  transition: 'transform 0.08s ease-out',
                }}
              >
                <div className="che-morph-card-frame">
                  {/* -----------------------------------------------------------
                      ACT 1: CREATE (Interactive Question Builder)
                      ----------------------------------------------------------- */}
                  {activeStage === 1 && (
                    <div className="che-card-face act-1" key="act-1">
                      <div className="aic-badge-row">
                        <span className="aic-type-badge">LIVE QUESTION BUILDER</span>
                        <span className="aic-interactive-hint">Click any option</span>
                      </div>

                      <h3 className="aic-question">What's your favorite way to learn?</h3>

                      <div className="aic-options-stack">
                        {options.map((opt) => {
                          const isSelected = selectedLearn === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`aic-option-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedLearn(opt.id)}
                            >
                              <div className="aic-opt-radio">
                                <div className={`aic-radio-circle ${isSelected ? 'checked' : ''}`}>
                                  {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                                </div>
                              </div>
                              <span className="aic-opt-icon">{opt.icon}</span>
                              <span className="aic-opt-label">{opt.label}</span>
                              {isSelected && <span className="aic-opt-tag">Selected</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div className="aic-card-footer">
                        <span className="aic-hint-text">Anonymous & secure submission</span>
                        <span className="aic-status-pill">Single Vote Allowed</span>
                      </div>
                    </div>
                  )}

                  {/* -----------------------------------------------------------
                      ACT 2: SHARE (Link, QR Code & Channels)
                      ----------------------------------------------------------- */}
                  {activeStage === 2 && (
                    <div className="che-card-face act-2" key="act-2">
                      <div className="scc-header">
                        <span className="scc-label">SHAREABLE POLL LINK</span>
                        <span className="scc-badge">Public Access</span>
                      </div>

                      <div className="scc-url-box">
                        <span className="scc-url-text">{pollUrl}</span>
                        <button className="btn-copy-link" onClick={handleCopy}>
                          {copied ? (
                            <>
                              <Check size={14} color="#10B981" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="scc-qr-share-row">
                        <div className="scc-qr-box">
                          <QRCodeSVG
                            value={pollUrl}
                            size={86}
                            level="M"
                            fgColor="#1E1B4B"
                            bgColor="#FFFFFF"
                            includeMargin={false}
                          />
                          <span className="scc-qr-caption">Scan to vote</span>
                        </div>

                        <div className="scc-channels-list">
                          <span className="scc-channels-heading">Instant Share Channels:</span>
                          <div className="scc-channel-buttons">
                            <div className="channel-btn whatsapp">
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </div>
                            <div className="channel-btn twitter">
                              <span>𝕏 Post</span>
                            </div>
                            <div className="channel-btn email">
                              <Send size={13} />
                              <span>Email</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* -----------------------------------------------------------
                      ACT 3: LIVE POLLING & RESULTS (User's Image 1!)
                      ----------------------------------------------------------- */}
                  {activeStage === 3 && (
                    <div className="che-card-face act-3" key="act-3">
                      <div className="hpc-header">
                        <div className="hpc-badge">
                          <span className="live-pulsing-dot" />
                          <span>LIVE POLLING</span>
                        </div>
                        <span className="hpc-votes-count">{votesCount} votes</span>
                      </div>

                      <h3 className="hpc-question">Which programming language do you prefer?</h3>

                      <div className="hpc-options-list">
                        <div className="hpc-option-row highlight">
                          <div className="hpc-opt-info">
                            <span className="hpc-opt-name">Python</span>
                            <span className="hpc-opt-pct">{barPython}%</span>
                          </div>
                          <div className="hpc-opt-bar-track">
                            <div
                              className="hpc-opt-bar-fill fill-python"
                              style={{ width: `${barPython}%`, transition: 'width 0.1s linear' }}
                            />
                          </div>
                        </div>

                        <div className="hpc-option-row">
                          <div className="hpc-opt-info">
                            <span className="hpc-opt-name">Java</span>
                            <span className="hpc-opt-pct">{barJava}%</span>
                          </div>
                          <div className="hpc-opt-bar-track">
                            <div
                              className="hpc-opt-bar-fill fill-java"
                              style={{ width: `${barJava}%`, transition: 'width 0.1s linear' }}
                            />
                          </div>
                        </div>

                        <div className="hpc-option-row">
                          <div className="hpc-opt-info">
                            <span className="hpc-opt-name">Go</span>
                            <span className="hpc-opt-pct">{barGo}%</span>
                          </div>
                          <div className="hpc-opt-bar-track">
                            <div
                              className="hpc-opt-bar-fill fill-go"
                              style={{ width: `${barGo}%`, transition: 'width 0.1s linear' }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="hpc-footer">
                        <span className="hpc-footer-hint">Live synchronization active</span>
                        <span className="hpc-footer-tag">Redis Engine</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Smartphone Mockup for Act 2: positioned beside card on the right */}
                {activeStage === 2 && (
                  <div
                    className="che-phone-layer"
                    style={{
                      transform: `translate3d(0, ${phoneTranslateY}px, 30px) rotateY(-14deg)`,
                      opacity: phoneOpacity,
                      pointerEvents: phoneOpacity > 0.4 ? 'auto' : 'none',
                      transition: 'transform 0.1s ease-out',
                    }}
                  >
                    <div className="smartphone-device-frame">
                      <div className="phone-screen-notch" />
                      <div className="phone-screen-content">
                        <div className="phone-status-bar">
                          <span>9:41</span>
                          <span className="phone-live-indicator">● LIVE</span>
                        </div>
                        <div className="phone-poll-preview">
                          <div className="phone-chat-bubble">
                            <span>Cast your vote now:</span>
                            <div className="phone-chat-link">https://pulsepoll.io/p/8X29K</div>
                          </div>
                          <div className="phone-poll-card">
                            <span className="pp-tag">PULSEPOLL</span>
                            <h4 className="pp-question">What's your favorite way to learn?</h4>
                            <div className="pp-opt active">Projects</div>
                            <div className="pp-opt">Videos</div>
                            <div className="pp-opt">Books</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subtle Scroll Hint in Act 1 */}
        {progress < 0.10 && (
          <div className="hero-scroll-hint">
            <span>Scroll down to experience the 3D journey</span>
            <ChevronDown size={14} className="scroll-chevron" />
          </div>
        )}
      </div>
    </div>
  );
}
