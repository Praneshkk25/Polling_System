import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ShareModal({ isOpen, onClose, poll, showToast }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !poll) return null;

  const pollUrl = `${window.location.origin}/#/poll/${poll.id}`;
  const resultsUrl = `${window.location.origin}/#/poll/${poll.id}/results`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    if (showToast) showToast('Link copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Vote on my poll: "${poll.question}" on PulsePoll!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(pollUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Vote on my poll: "${poll.question}" 👉 ${pollUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="modal-header">
          <h2>Share Poll 🎉</h2>
          <p style={{ fontWeight: 600, color: '#111827', marginTop: '4px' }}>
            "{poll.question}"
          </p>
        </div>

        {/* Share Link Field */}
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Poll Voting Link</label>
          <div className="share-link-box">
            <input
              type="text"
              readOnly
              className="share-link-input"
              value={pollUrl}
              onClick={(e) => e.target.select()}
            />
            <button
              type="button"
              className="btn-card-action primary"
              style={{ flexShrink: 0 }}
              onClick={handleCopy}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="qr-code-wrapper">
          <QRCodeSVG value={pollUrl} size={150} level="M" includeMargin={true} />
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', fontWeight: 600 }}>
            Scan with smartphone camera to vote instantly
          </div>
        </div>

        {/* Social Share Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className="btn-card-action"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={shareOnWhatsApp}
          >
            WhatsApp
          </button>
          <button
            type="button"
            className="btn-card-action"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={shareOnTwitter}
          >
            Twitter / X
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <a
            href={pollUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-card-action"
            style={{ justifyContent: 'center', padding: '10px' }}
          >
            <ExternalLink size={14} />
            <span>Open Voting Page</span>
          </a>

          <a
            href={resultsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '10px' }}
          >
            <span>View Live Results</span>
          </a>
        </div>
      </div>
    </div>
  );
}
