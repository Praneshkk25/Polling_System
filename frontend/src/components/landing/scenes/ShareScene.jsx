import React, { useState } from 'react';
import { Copy, Check, MessageCircle, Send } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ScrollScene from '../motion/ScrollScene';
import Motion3DCard from '../motion/Motion3DCard';

export default function ShareScene() {
  const [copied, setCopied] = useState(false);
  const pollUrl = 'https://pulsepoll.io/p/8X29K';

  const handleCopy = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollScene id="share" className="scene-share-stage">
      {() => (
        <div className="scene-container share-scene-container">
          <div className="scene-ambient-glow glow-blue" />

          {/* Headline Section */}
          <div className="scene-text-header">
            <div className="scene-step-tag">02 / SHARE</div>
            <h2 className="scene-headline">
              Share it <span className="gradient-text-purple">anywhere.</span>
            </h2>
            <p className="scene-subheading">
              Get a clean link or instant QR code and share it with your audience in seconds. Works flawlessly across desktop, tablet, and smartphone browsers.
            </p>
          </div>

          {/* 3D Visual Split: Share Card on Left, Smartphone on Right */}
          <div className="share-elements-layout">
            {/* Left: Floating URL & QR Code Card */}
            <div className="share-card-anchor">
              <Motion3DCard className="share-control-card" maxRotateX={14} maxTranslateZ={50}>
                <div className="scc-header">
                  <span className="scc-label">SHAREABLE POLL LINK</span>
                  <span className="scc-badge">Public Access</span>
                </div>

                {/* URL Input Bar with 1-Click Copy */}
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

                {/* QR Code and Sharing Channels */}
                <div className="scc-body-split">
                  <div className="scc-qr-wrap">
                    <div className="scc-qr-box">
                      <QRCodeSVG value={pollUrl} size={110} level="M" />
                    </div>
                    <div className="scc-qr-note">
                      <span className="handwritten-scan-text">Scan to Vote! ➔</span>
                    </div>
                  </div>

                  <div className="scc-channels-list">
                    <span className="channels-title">Fast Share Channels</span>
                    <div className="channels-grid">
                      <div className="channel-pill whatsapp">
                        <MessageCircle size={15} color="#25D366" />
                        <span>WhatsApp</span>
                      </div>
                      <div className="channel-pill twitter">
                        <span className="x-logo">𝕏</span>
                        <span>Twitter</span>
                      </div>
                      <div className="channel-pill email">
                        <Send size={14} color="#3B82F6" />
                        <span>Direct Email</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Motion3DCard>
            </div>

            {/* Right: Realistic Smartphone Mockup Showing Incoming Poll */}
            <div className="smartphone-showcase-anchor">
              <div className="smartphone-device-frame">
                <div className="phone-screen-notch" />
                <div className="phone-screen-content">
                  <div className="phone-status-bar">
                    <span>9:41</span>
                    <span className="phone-live-indicator">● LIVE</span>
                  </div>

                  <div className="phone-poll-preview">
                    <div className="phone-chat-bubble">
                      <span>Check out this live poll!</span>
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
          </div>
        </div>
      )}
    </ScrollScene>
  );
}
