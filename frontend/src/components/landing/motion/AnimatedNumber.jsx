import React from 'react';

/**
 * AnimatedNumber component.
 * Displays smoothly formatted numbers with optional prefix and suffix.
 */
export default function AnimatedNumber({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const formatted = typeof value === 'number'
    ? value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : value;

  return (
    <span className={`animated-number-display ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
