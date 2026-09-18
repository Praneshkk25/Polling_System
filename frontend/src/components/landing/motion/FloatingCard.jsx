import React from 'react';
import { useMouseTilt } from './useMouseTilt';

/**
 * FloatingCard component.
 * Provides subtle interactive 3D mouse tilt and smooth transform response.
 */
export default function FloatingCard({
  className = '',
  style = {},
  maxTilt = 6,
  children,
  onClick,
}) {
  const { tilt, handleMouseMove, handleMouseLeave } = useMouseTilt(maxTilt);

  const tiltTransform = `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`;

  return (
    <div
      className={`pulsepoll-floating-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: tiltTransform,
        transition: 'transform 0.15s ease-out, box-shadow 0.25s ease',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
