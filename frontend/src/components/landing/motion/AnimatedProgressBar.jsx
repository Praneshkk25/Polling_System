import React from 'react';

/**
 * AnimatedProgressBar component.
 * Animates bar fill width smoothly with customizable gradient colors.
 */
export default function AnimatedProgressBar({
  percentage = 0,
  color = '#7C3AED',
  height = 8,
  className = '',
}) {
  return (
    <div
      className={`animated-progress-track ${className}`}
      style={{
        width: '100%',
        backgroundColor: '#F1F5F9',
        borderRadius: 999,
        height: `${height}px`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        className="animated-progress-fill"
        style={{
          width: `${Math.min(100, Math.max(0, percentage))}%`,
          height: '100%',
          background: typeof color === 'string' && color.includes('gradient')
            ? color
            : `linear-gradient(90deg, ${color}, #A78BFA)`,
          borderRadius: 999,
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}
