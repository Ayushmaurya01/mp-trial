import React from 'react';

const CircularGauge = ({ percentage = 0, size = 110, strokeWidth = 10, label = '', showLabel = true }) => {
  const safePct = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  let color = '#10b981'; // green
  if (safePct < 50) color = '#ef4444'; // red
  else if (safePct < 75) color = '#f59e0b'; // amber

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: size >= 110 ? '1.15rem' : size >= 80 ? '0.88rem' : '0.75rem',
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1,
            }}
          >
            {safePct}%
          </span>
        </div>
      </div>
      {showLabel && label && (
        <span style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default CircularGauge;
