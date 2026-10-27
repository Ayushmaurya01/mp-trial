import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: '#f8fafc' }}>
      {/* Header Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: 'white',
              display: 'flex',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>PerformTracker</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4rem 2rem 3rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={16} /> Individual Student Academic Tracker
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            lineHeight: 1.15,
            fontWeight: 800,
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Master Your Academic Journey with Real-Time Progress Analytics
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '720px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Track subjects, unit completion, topic checklists, lecture history, attendance percentages, and pending assignments from one clear, modern student dashboard.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            Get Started Now <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            Existing Student Login
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2.5rem', color: '#f8fafc' }}>
          Everything You Need to Excel Academically
        </h2>

        <div className="grid-3">
          <div className="card">
            <BookOpen size={32} color="#6366f1" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Subject & Topic Tracking</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Organize subjects into units and topics. Mark topics complete as you study and watch your unit progress update automatically.
            </p>
          </div>

          <div className="card">
            <Calendar size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Attendance Monitoring</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Log present and absent lectures per subject. Receive automated warnings when your attendance dips below 75%.
            </p>
          </div>

          <div className="card">
            <TrendingUp size={32} color="#3b82f6" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Automatic Calculations</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Real-time mathematical formulas compute subject completion, assignment completion rates, and overall student progress.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '2rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.85rem',
        }}
      >
        <p>Student Performance Tracker • B.Tech Mini Project • Built for Academic Excellence</p>
      </footer>
    </div>
  );
};

export default LandingPage;
