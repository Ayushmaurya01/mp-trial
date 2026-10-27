import React from 'react';

const ProgressBar = ({ percentage = 0, height = 8, color, showText = false }) => {
  const safePct = Math.min(100, Math.max(0, percentage));

  let barColor = color;
  if (!barColor) {
    if (safePct < 50) barColor = '#ef4444';
    else if (safePct < 75) barColor = '#f59e0b';
    else barColor = '#10b981';
  }

  return (
    <div style={{ width: '100%' }}>
      {showText && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
          <span>Completion</span>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{safePct}%</span>
        </div>
      )}
      <div className="progress-bar-bg" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${safePct}%`, background: barColor, height: '100%' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
