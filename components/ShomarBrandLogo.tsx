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
      {/* Precision polygon replicating the folded geometric planar "S" */}
      <path
        d="M31.5 28.5L68.5 24.5L69.5 39.5L47.5 41.5L70.5 52.5L51.5 71.5L65.5 70.5L62.5 84.5L33.5 77.5L30.5 64.5L52.5 58.5L30.5 47.5L31.5 28.5Z"
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
