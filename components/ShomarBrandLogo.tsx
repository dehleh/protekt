import React from 'react';

interface ShomarBrandLogoProps {
  size?: number | string;
  className?: string;
  color?: string;
}

/**
 * Official SHOMAR Folded Geometric "S" Monogram Mark
 * Precision vectorized from the brand identity specifications.
 */
export function ShomarBrandLogo({
  size = 36,
  className = '',
  color = '#0000FF',
}: ShomarBrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SHOMAR Monogram Mark"
    >
      {/* Precision 10-point folded geometric 'S' monogram */}
      <path
        d="M90.1 0L3.2 7L0 43L50 62L1.2 76.3L7 100L88 76.3L94.7 52L41.8 32.2L92.4 27.5Z"
        fill={color}
      />
    </svg>
  );
}

export function ShomarLogoWithText({
  size = 36,
  textColor = '#0C0C0C',
}: {
  size?: number;
  textColor?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <ShomarBrandLogo size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: `${size * 0.55}px`,
            letterSpacing: '0.04em',
            color: textColor,
          }}
        >
          SHOMAR
        </span>
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: `${size * 0.28}px`,
            letterSpacing: '0.22em',
            color: '#29ABE2',
            marginTop: '2px',
          }}
        >
          PROTECT
        </span>
      </div>
    </div>
  );
}
