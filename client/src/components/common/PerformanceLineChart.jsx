import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: entry.color,
              marginBottom: '0.2rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: entry.color,
              }}
            />
            <span style={{ color: '#94a3b8' }}>{entry.name}:</span>
            <strong style={{ color: '#f8fafc' }}>{entry.value}%</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceLineChart = ({
  data = [],
  title = 'Performance Line Trend Analysis',
  height = 300,
  lines = [
    { key: 'overallSubjectProgress', name: 'Overall Progress %', color: '#6366f1' },
    { key: 'attendancePct', name: 'Attendance Rate %', color: '#10b981' },
    { key: 'topicPct', name: 'Syllabus Topic %', color: '#3b82f6' },
  ],
  showReferenceLine = true,
  referenceValue = 75,
  referenceLabel = 'Min Required Threshold (75%)',
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '0.88rem',
          border: '1px stroke #334155',
          borderRadius: '8px',
        }}
      >
        No chart data available yet.
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '1.75rem' }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600 }}>{title}</h3>
          {showReferenceLine && (
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: '#f59e0b', display: 'inline-block' }} />
              {referenceLabel}
            </span>
          )}
        </div>
      )}

      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 25, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#94a3b8' }}
              iconType="circle"
            />
            {showReferenceLine && (
              <ReferenceLine
                y={referenceValue}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: `${referenceValue}% Target`, fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }}
              />
            )}
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name}
                stroke={l.color}
                strokeWidth={3}
                dot={{ r: 4, fill: l.color, stroke: '#0f172a', strokeWidth: 2 }}
                activeDot={{ r: 7, stroke: '#f8fafc', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceLineChart;
