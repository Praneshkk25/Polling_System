import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Premium Interactive Button Component
 * Features:
 * - Click Ripple Wave
 * - Shimmer Light Sweep on Hero variant
 * - Magnetic micro-lift & press feedback
 * - Variants: 'primary', 'secondary', 'gradient', 'hero', 'ghost', 'danger', 'outline'
 * - Sizes: 'sm', 'md', 'lg'
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  disabled = false,
  fullWidth = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className = '',
  onClick,
  id,
  style = {},
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Create interactive ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev.slice(-4), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 650);

    if (onClick) onClick(e);
  };

  const baseClass = `btn-react-ui btn-${variant} btn-size-${size} ${fullWidth ? 'btn-full-width' : ''} ${
    loading ? 'btn-is-loading' : ''
  } ${className}`;

  return (
    <button
      id={id}
      type={type}
      className={baseClass}
      disabled={disabled || loading}
      onClick={handleClick}
      style={style}
      {...props}
    >
      {/* Click ripple animations */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="btn-ui-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}

      {/* Shimmer sweep effect on hero variant */}
      {variant === 'hero' && <span className="btn-shimmer-sweep" />}

      {/* Content */}
      <span className="btn-ui-content">
        {loading ? (
          <>
            <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-ui-spinner" />
            <span>{loadingText || 'Please wait...'}</span>
          </>
        ) : (
          <>
            {IconLeft && (
              <span className="btn-icon-left">
                {React.isValidElement(IconLeft)
                  ? IconLeft
                  : React.createElement(IconLeft, { size: size === 'sm' ? 14 : 17, strokeWidth: 2 })}
              </span>
            )}
            <span className="btn-text-label">{children}</span>
            {IconRight && (
              <span className="btn-icon-right">
                {React.isValidElement(IconRight)
                  ? IconRight
                  : React.createElement(IconRight, { size: size === 'sm' ? 14 : 17, strokeWidth: 2 })}
              </span>
            )}
          </>
        )}
      </span>
    </button>
  );
}
