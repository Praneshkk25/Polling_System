import React, { useState } from 'react';
import { Check } from 'lucide-react';
import ScrollScene from '../motion/ScrollScene';
import Motion3DCard from '../motion/Motion3DCard';

export default function AskAnythingScene() {
  const [selectedOpt, setSelectedOpt] = useState('projects');

  const options = [
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'projects', label: 'Projects', icon: '💻' },
    { id: 'courses', label: 'Courses', icon: '🎓' },
  ];

  return (
    <ScrollScene id="create" className="scene-ask-stage">
      {() => (
        <div className="scene-container ask-anything-container">
          {/* Ambient Lighting */}
          <div className="scene-ambient-glow glow-lavender" />

          {/* Section Header */}
          <div className="scene-text-header">
            <div className="scene-step-tag">01 / CREATE</div>
            <h2 className="scene-headline">
              Ask <span className="gradient-text-purple">anything.</span>
            </h2>
            <p className="scene-subheading">
              Turn a simple question into a conversation. From classroom discussions to product feedback, PulsePoll turns questions into real insights.
            </p>
          </div>

          {/* Poll Card */}
          <div className="ask-card-wrapper">
            <Motion3DCard className="ask-interactive-card" maxRotateX={16} maxTranslateZ={50}>
              <div className="aic-badge-row">
                <span className="aic-type-badge">LIVE DEMO POLL</span>
                <span className="aic-interactive-hint">Click any option to test</span>
              </div>

              <h3 className="aic-question">What's your favorite way to learn?</h3>

              <div className="aic-options-stack">
                {options.map((opt) => {
                  const isSelected = selectedOpt === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={`aic-option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedOpt(opt.id)}
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
            </Motion3DCard>

            {/* Handwritten note: "Simple. Fast. Beautiful." */}
            <div className="handwritten-note ask-note">
              <span>Simple. Fast. Beautiful.</span>
              <svg width="45" height="20" viewBox="0 0 50 25" fill="none">
                <path d="M5 15 C 20 5, 35 20, 45 10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
          </div>
        </div>
      )}
    </ScrollScene>
  );
}
