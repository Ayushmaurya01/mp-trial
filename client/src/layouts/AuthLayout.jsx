import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '0.65rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            color: 'white',
            display: 'flex',
          }}
        >
          <GraduationCap size={28} />
        </div>
        <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', fontWeight: 800 }}>PerformTracker</h1>
      </Link>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
