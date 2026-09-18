import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import PostLoginCelebration from './auth/PostLoginCelebration';

export default function AuthModal({ isOpen, onClose, showToast }) {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationUser, setCelebrationUser] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let authUser = null;
      if (isSignup) {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        authUser = await signup(name.trim(), email.trim(), password);
        if (showToast) showToast('Account created successfully! 🎉');
      } else {
        authUser = await login(email.trim(), password);
        if (showToast) showToast('Welcome back! 👋');
      }
      setCelebrationUser(authUser || { name: isSignup ? name.trim() : email.split('@')[0], email });
      setShowCelebration(true);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const authUser = await login('pranesh@pulsepoll.io', 'Password123!');
      if (showToast) showToast('Logged in as Pranesh (Creator) 👋');
      setCelebrationUser(authUser || { name: 'Pranesh', email: 'pranesh@pulsepoll.io' });
      setShowCelebration(true);
    } catch (err) {
      setError(err.message || 'Failed to login with demo credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showCelebration && (
        <PostLoginCelebration
          user={celebrationUser}
          onComplete={() => {
            setShowCelebration(false);
            onClose();
          }}
        />
      )}

      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ width: '440px' }} onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>

          <div className="modal-header">
            <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignup ? 'Join PulsePoll to create and manage real-time polls.' : 'Sign in to manage your polls and view analytics.'}</p>
          </div>

          {/* Tab switch */}
          <div style={{
            display: 'flex',
            background: '#F3F4F6',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            marginBottom: '20px',
          }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: !isSignup ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '13px',
                color: !isSignup ? '#111827' : '#6B7280',
                cursor: 'pointer',
                boxShadow: !isSignup ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
              onClick={() => { setIsSignup(false); setError(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: isSignup ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '13px',
                color: isSignup ? '#111827' : '#6B7280',
                cursor: 'pointer',
                boxShadow: isSignup ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
              onClick={() => { setIsSignup(true); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: 600,
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pranesh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                iconLeft={isSignup ? UserPlus : LogIn}
              >
                {isSignup ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Quick Demo Login Option using React Button Component */}
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="sm"
              iconLeft={Sparkles}
              disabled={loading}
              onClick={handleQuickDemoLogin}
            >
              1-Click Demo Login as Pranesh
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
