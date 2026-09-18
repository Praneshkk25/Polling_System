import React from 'react';
import { CheckCircle2, Share2, Vote, Activity } from 'lucide-react';
import ScrollScene from '../motion/ScrollScene';

export default function ProductFlowScene() {
  const steps = [
    { num: '01', title: 'CREATE', desc: 'Ask any question with custom options', icon: CheckCircle2, color: '#7C3AED' },
    { num: '02', title: 'SHARE', desc: 'Distribute via instant link or QR code', icon: Share2, color: '#2563EB' },
    { num: '03', title: 'VOTE', desc: 'Audience votes anonymously on any device', icon: Vote, color: '#059669' },
    { num: '04', title: 'LIVE RESULTS', desc: 'Watch charts animate with zero refresh', icon: Activity, color: '#D97706' },
  ];

  return (
    <ScrollScene id="product-flow" className="scene-flow-stage">
      {() => (
        <div className="scene-container product-flow-container">
          <div className="scene-ambient-glow glow-blue-soft" />

          {/* Header */}
          <div className="scene-text-header">
            <div className="scene-step-tag">06 / PRODUCT ECOSYSTEM</div>
            <h2 className="scene-headline">
              The frictionless <span className="gradient-text-purple">polling flow.</span>
            </h2>
            <p className="scene-subheading">
              Four simple steps from question formulation to real-time collective consensus.
            </p>
          </div>

          {/* Horizontal Timeline Flow */}
          <div className="flow-steps-track">
            <div className="flow-line-bar-background">
              <div
                className="flow-line-bar-fill"
                style={{
                  width: '100%',
                }}
              />
            </div>

            <div className="flow-steps-grid">
              {steps.map((step) => {
                const IconComp = step.icon;

                return (
                  <div key={step.num} className="flow-step-node">
                    <div className="flow-node-badge" style={{ borderColor: step.color }}>
                      <IconComp size={20} color={step.color} />
                    </div>
                    <span className="flow-node-num">{step.num}</span>
                    <h3 className="flow-node-title">{step.title}</h3>
                    <p className="flow-node-desc">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </ScrollScene>
  );
}
