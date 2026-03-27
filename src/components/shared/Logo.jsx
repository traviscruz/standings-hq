import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared Branding Component
 * @param {string} className - Optional class name for the wrapper
 * @param {string} size - 'sm', 'md', 'lg' presets for logo mark
 * @param {boolean} showText - Whether to show "StandingsHQ" text
 * @param {string} to - Link destination (default: "/")
 * @param {boolean} dark - Dark mode (for dark backgrounds)
 */
const Logo = ({ className = '', size = 'md', showText = true, to = '/', dark = false }) => {
  const sizes = {
    sm: { box: '28px', svg: '14', radius: '6px' },
    md: { box: '32px', svg: '18', radius: '8px' },
    lg: { box: '40px', svg: '24', radius: '10px' }
  };

  const s = sizes[size] || sizes.md;

  return (
    <Link
      to={to}
      className={`logo-component ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : '10px',
        textDecoration: 'none'
      }}
    >
      <div style={{
        background: dark ? '#fff' : 'var(--navy)',
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }}>
        <svg width={s.svg} height={s.svg} viewBox="0 0 18 18" fill="none">
          <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke={dark ? 'var(--navy)' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12.5" cy="5" r="2" fill="var(--accent)" />
        </svg>
      </div>

      {showText && (
        <span style={{
          fontFamily: 'var(--font-d)',
          fontSize: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
          fontWeight: 800,
          color: dark ? '#fff' : 'var(--navy)',
          letterSpacing: '-0.02em'
        }}>
          Standings<span style={{ color: 'var(--accent)' }}>HQ</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
