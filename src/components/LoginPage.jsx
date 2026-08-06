import React, { useState } from 'react';
import { Shield, Lock, Award, BookOpen, GraduationCap, Clipboard, ArrowLeft } from 'lucide-react';

export default function LoginPage({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password: password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Incorrect username or password. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to the backend server. Make sure it is started on port 8081.');
    }
  };

  return (
    <div className="login-page-container">
      {/* Back to Home Button */}
      <button onClick={() => onNavigate('landing')} className="btn btn-secondary login-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      {/* Login Box with Floating Security & Study Icons */}
      <div className="login-card-wrapper">
        {/* Animated Floating and Rotating Icons */}
        <div className="login-rotating-icon login-rot-1 animate-spin-slow">
          <Shield size={24} />
        </div>
        <div className="login-rotating-icon login-rot-2">
          <GraduationCap size={24} />
        </div>
        <div className="login-rotating-icon login-rot-3">
          <BookOpen size={24} />
        </div>
        <div className="login-rotating-icon login-rot-4">
          <Lock size={24} />
        </div>
        
        {/* Extra floating icons */}
        <div className="login-rotating-icon animate-float" style={{ bottom: '110%', left: '40%', color: 'var(--accent)' }}>
          <Award size={22} />
        </div>
        <div className="login-rotating-icon animate-float" style={{ top: '40%', right: '-55px', color: 'var(--warning)', animationDelay: '1.2s' }}>
          <Clipboard size={22} />
        </div>

        {/* Main Sign in Panel */}
        <div className="glass-panel login-card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to your account</p>
          </div>

          {error && (
            <div className="glass-panel" style={{ background: 'var(--danger-glow)', border: '1px solid var(--danger)', padding: '12px 16px', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Username/Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Note: Forgot Password link removed entirely */}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Sign In
            </button>
          </form>

          {/* Quick Login helpers to ease testing */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>DEMO CREDENTIALS (CLICK TO AUTO-FILL):</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              <span 
                onClick={() => { setEmail('studentp101@kce.ac.in'); setPassword('studentp101'); }}
                style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
              >
                Student
              </span>
              <span 
                onClick={() => { setEmail('teacherp101@kce.ac.in'); setPassword('teacherp101'); }}
                style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
              >
                Teacher
              </span>
              <span 
                onClick={() => { setEmail('counselormeerajegan@kce.ac.in'); setPassword('meerajegan'); }}
                style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
              >
                Counselor
              </span>
              <span 
                onClick={() => { setEmail('adminsuresh@kce.ac.in'); setPassword('admin'); }}
                style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
              >
                Admin
              </span>
              <span 
                onClick={() => { setEmail('principalkrishnamurthy@kce.ac.in'); setPassword('Krishnamurthy'); }}
                style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
              >
                Principal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
