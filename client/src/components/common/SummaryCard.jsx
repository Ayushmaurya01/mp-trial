import React from 'react';

const SummaryCard = ({ title, value, subtext, icon: Icon, color = '#6366f1', badge }) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{title}</span>
        {Icon && (
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: `${color}18`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
          {value}
        </h2>
        {badge && (
          <span className={`badge badge-${badge.type || 'info'}`}>{badge.text}</span>
        )}
      </div>

      {subtext && (
        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{subtext}</p>
      )}
    </div>
  );
};

export default SummaryCard;
