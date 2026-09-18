import React from 'react';

/**
 * ParallaxLayer component.
 * Applies GPU-friendly 3D translate and scale transforms proportional to scroll progress and layer depth.
 */
export default function ParallaxLayer({
  progress = 0,
  depth = 0.5, // 0.1 = slow background, 0.5 = medium, 1.0 = normal, 1.5 = fast foreground
  maxOffsetY = 100, // Max vertical pixel movement
  maxOffsetX = 0,
  maxOffsetZ = 0,
  scaleRange = [1, 1],
  opacityRange = [1, 1],
  rotateRange = [0, 0],
  className = '',
  style = {},
  children,
}) {
  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return (
      <div className={`parallax-layer ${className}`} style={style}>
        {children}
      </div>
    );
  }

  const translateY = (progress - 0.5) * maxOffsetY * depth * 2;
  const translateX = (progress - 0.5) * maxOffsetX * depth * 2;
  const translateZ = (progress - 0.5) * maxOffsetZ * depth * 2;
  const scale = scaleRange[0] + progress * (scaleRange[1] - scaleRange[0]);
  const opacity = Math.max(0, Math.min(1, opacityRange[0] + progress * (opacityRange[1] - opacityRange[0])));
  const rotate = rotateRange[0] + progress * (rotateRange[1] - rotateRange[0]);

  const transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, ${translateZ.toFixed(1)}px) scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg)`;

  return (
    <div
      className={`parallax-layer ${className}`}
      style={{
        transform,
        opacity,
        willChange: 'transform, opacity',
        transition: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
