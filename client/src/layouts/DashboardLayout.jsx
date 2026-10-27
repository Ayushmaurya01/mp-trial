import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/api';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const handleSeedDemoData = async () => {
    if (window.confirm('Do you want to insert sample academic demo subjects, units, attendance & assignments into your account?')) {
      try {
        setSeeding(true);
        const res = await authService.seedDemoData();
        if (res.data.success) {
          showSuccess('Sample academic demo data inserted successfully!');
          window.location.reload();
        }
      } catch (err) {
        showError('Failed to seed demo data');
      } finally {
        setSeeding(false);
      }
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Subjects', path: '/subjects', icon: BookOpen },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Assignments', path: '/assignments', icon: FileCheck2 },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
        }}
        className="desktop-sidebar"
      >
        {/* Brand */}
        <div
          style={{
            padding: '1.5rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
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
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>PerformTracker</h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>Academic Tracker</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.2s ease',
                })}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={handleSeedDemoData}
              disabled={seeding}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.8rem', justifyContent: 'flex-start' }}
            >
              <Sparkles size={16} color="#fbbf24" />
              <span>{seeding ? 'Seeding Data...' : 'Seed Demo Data'}</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.92rem',
                fontWeight: 500,
                color: '#f87171',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main App Workspace */}
      <div className="main-content">
        {/* Top Header */}
        <header className="header-bar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Academic Year:</span>
            <span className="badge badge-info">{user?.course || 'B.Tech CS'}</span>
            <span className="badge badge-success">{user?.semester || 'Semester 5'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="user-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>{user?.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              zIndex: 50,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '1rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  })}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1rem',
                color: '#f87171',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Page Body Outlet */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .user-info-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
