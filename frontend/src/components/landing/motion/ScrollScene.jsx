import React, { useState, useEffect, useRef } from 'react';

/**
 * Robust, snappy ScrollScene component.
 * Uses an IntersectionObserver to trigger smooth, high-performance entrance reveals.
 * Once revealed, content STAYS 100% visible with zero fade-to-white or sticky trapping.
 */
export default function ScrollScene({
  id,
  className = '',
  style = {},
  children,
}) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      {
        threshold: 0,
        rootMargin: '400px 0px 400px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pass progress = 1 if inView (or smoothly transitioning) so content is always rich and visible
  const progress = inView ? 1 : 0.85;

  return (
    <section
      id={id}
      ref={containerRef}
      className={`landing-scene-section ${inView ? 'scene-in-view' : ''} ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        className="scroll-scene-viewport"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1200px',
        }}
      >
        {typeof children === 'function' ? children(progress) : children}
      </div>
    </section>
  );
}
