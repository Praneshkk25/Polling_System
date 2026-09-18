import React, { useRef, useState, useEffect } from 'react';
import { useMouseTilt } from './useMouseTilt';

/**
 * Motion3DCard component.
 * Applies true scroll-driven 3D perspective transforms (rotateX, rotateY, translateZ, scale)
 * based on the element's position in the viewport, matching Video-35008.mp4 motion mechanics.
 * Smoothly reversible when scrolling backward.
 * Also includes subtle desktop mouse tilt micro-interactions.
 */
export default function Motion3DCard({
  children,
  className = '',
  style = {},
  maxRotateX = 16,
  maxTranslateZ = 50,
  scaleBoost = 0.06,
}) {
  const cardRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const { tilt, onMouseMove, onMouseLeave } = useMouseTilt(6);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!cardRef.current) return;
          const rect = cardRef.current.getBoundingClientRect();
          const winHeight = window.innerHeight;

          // Calculate progress from 0 (just entering bottom) to 1 (leaving top)
          const totalDistance = winHeight + rect.height;
          const currentPos = winHeight - rect.top;
          const raw = currentPos / totalDistance;
          const clamped = Math.max(0, Math.min(1, raw));
          setScrollProgress(clamped);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // distFromCenter: -0.5 (at bottom) -> 0.0 (dead center) -> +0.5 (at top)
  const distFromCenter = scrollProgress - 0.5;
  // Dynamic 3D tilt from scroll
  const scrollRotateX = distFromCenter * -maxRotateX * 1.5;
  // Center prominence (1 at center, 0 at edges)
  const centerWeight = Math.max(0, 1 - Math.abs(distFromCenter) * 2.2);
  const scrollTranslateZ = centerWeight * maxTranslateZ;
  const scrollScale = 0.94 + centerWeight * scaleBoost;

  return (
    <div
      ref={cardRef}
      className={`motion-3d-card-wrapper ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1200px) rotateX(${scrollRotateX + tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${scrollTranslateZ}px) scale(${scrollScale})`,
        transition: 'transform 0.08s ease-out',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
