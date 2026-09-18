import { useState, useEffect } from 'react';

/**
 * Interpolates a value from an input range to an output range with multi-stop support and clamping.
 */
export function interpolate(val, inputRange, outputRange, clamp = true) {
  if (!inputRange || !outputRange || inputRange.length === 0) return 0;
  
  if (inputRange.length === 2) {
    const [inMin, inMax] = inputRange;
    const [outMin, outMax] = outputRange;
    if (inMax === inMin) return outMin;
    if (clamp) {
      if (val <= inMin) return outMin;
      if (val >= inMax) return outMax;
    }
    const ratio = (val - inMin) / (inMax - inMin);
    return outMin + ratio * (outMax - outMin);
  }

  // Multi-stop piecewise linear interpolation
  const n = Math.min(inputRange.length, outputRange.length);
  if (clamp) {
    if (val <= inputRange[0]) return outputRange[0];
    if (val >= inputRange[n - 1]) return outputRange[n - 1];
  }

  for (let i = 0; i < n - 1; i++) {
    const inMin = inputRange[i];
    const inMax = inputRange[i + 1];
    if (val >= inMin && val <= inMax) {
      const outMin = outputRange[i];
      const outMax = outputRange[i + 1];
      if (inMax === inMin) return outMin;
      const ratio = (val - inMin) / (inMax - inMin);
      return outMin + ratio * (outMax - outMin);
    }
  }

  return outputRange[n - 1];
}

/**
 * Calculates scroll progress (0 to 1) of a container element relative to the viewport.
 * When the container top reaches the top of the viewport, progress = 0.
 * When the container bottom reaches the bottom of the viewport, progress = 1.
 */
export function useScrollProgress(containerRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = rect.height - windowHeight;

      if (totalDist <= 0) {
        // Fallback if container is smaller or equal to viewport
        const visibleRatio = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
        setProgress(visibleRatio);
        ticking = false;
        return;
      }

      // When rect.top <= 0, container has reached the top of screen
      const scrolled = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, scrolled / totalDist));
      setProgress(rawProgress);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerRef]);

  return progress;
}

/**
 * Global scroll percentage hook for top progress bar.
 */
export function useGlobalScrollProgress() {
  const [globalProgress, setGlobalProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        setGlobalProgress(Math.max(0, Math.min(1, window.scrollY / scrollable)));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return globalProgress;
}
