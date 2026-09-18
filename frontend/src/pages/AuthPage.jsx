import React, { useState } from 'react';
import {
  Zap, Radio, BarChart2, ShieldCheck, Users, Eye, EyeOff,
  ArrowLeft, CheckCircle2, AlertCircle, Sparkles, LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import PostLoginCelebration from '../components/auth/PostLoginCelebration';

export default function AuthPage({ initialMode = 'login', onBackToHome, onSuccess, showToast }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationUser, setCelebrationUser] = useState(null);

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      let authedUser;
      if (mode === 'login') {
        authedUser = await login(email.trim(), password);
        if (showToast) showToast('Welcome back! Successfully signed in. ✨');
      } else {
        authedUser = await signup(name.trim(), email.trim(), password);
        if (showToast) showToast('Account created successfully! Welcome to PulsePoll. 🎉');
      }
      setCelebrationUser(authedUser || { email: email.trim(), name: name.trim() || 'Creator' });
      setShowCelebration(true);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('pranesh@pulsepoll.io');
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      {/* Unique Post-Login Cinematic Holographic Animation */}
      {showCelebration && (
        <PostLoginCelebration
          user={celebrationUser}
          onComplete={() => {
            if (onSuccess) onSuccess();
          }}
        />
      )}

      {/* Back to Home Button using React Button Component */}
      <div className="auth-back-nav">
        <Button variant="ghost" size="sm" iconLeft={ArrowLeft} onClick={onBackToHome}>
          Back to Home
        </Button>
      </div>

      <div className="auth-split-card">
        {/* Left Column: Visual Storytelling & Testimonial */}
        <div className="auth-left-visual">
          <div className="auth-brand-row">
            <div className="brand-logo-icon">
              <Zap size={20} color="#7C3AED" strokeWidth={2.8} />
            </div>
            <div className="brand-text-group">
              <span className="brand-name">PulsePoll</span>
              <span className="brand-tagline">Ideas in Real Time</span>
            </div>
          </div>

          <div className="auth-value-prop">
            <h2>
              Turn Opinions<br />
              <span className="gradient-text-purple">into Insights.</span>
            </h2>

            <div className="auth-bullets-list">
              <div className="auth-bullet-item">
                <div className="bullet-icon-box">
                  <Radio size={16} color="#7C3AED" />
                </div>
                <span>Live Polling & Zero-Refresh Updates</span>
              </div>
              <div className="auth-bullet-item">
                <div className="bullet-icon-box">
                  <BarChart2 size={16} color="#7C3AED" />
                </div>
                <span>Beautiful Category & Participation Analytics</span>
              </div>
              <div className="auth-bullet-item">
                <div className="bullet-icon-box">
                  <ShieldCheck size={16} color="#7C3AED" />
                </div>
                <span>Secure & Reliable Storage with MongoDB Atlas</span>
              </div>
              <div className="auth-bullet-item">
                <div className="bullet-icon-box">
                  <Users size={16} color="#7C3AED" />
                </div>
                <span>Join a Global Real-Time Community</span>
              </div>
            </div>
          </div>

          {/* Photographic Image Frame of woman working on laptop */}
          <div className="auth-photo-frame">
            <img
              src="/assets/login_woman.jpg"
              alt="Professional working on laptop"
              className="auth-photo-img"
            />
            <div className="auth-quote-card">
              <p>“PulsePoll made our classroom and team discussions so engaging!”</p>
              <span className="quote-author">— Amanda, Educator & Creator</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Form Card */}
        <div className="auth-right-form">
          <div className="auth-form-header">
            <h3 className="auth-form-title">
              {mode === 'login' ? 'Welcome back 👋' : 'Create an Account 🚀'}
            </h3>
            <p className="auth-form-subtitle">
              {mode === 'login' ? 'Sign in to continue to your creator dashboard' : 'Start launching interactive live polls today'}
            </p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Pranesh Kumar"
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
                placeholder="you@pulsepoll.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="auth-link-hint"
                    onClick={handleFillDemo}
                    title="Fill verified demo credentials"
                  >
                    Quick Demo Fill
                  </button>
                )}
              </div>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input password-field"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="auth-extra-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <span className="auth-link-muted">Forgot password?</span>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              fullWidth
              loading={loading}
              loadingText="Verifying credentials..."
              iconRight={mode === 'login' ? LogIn : UserPlus}
              style={{ marginTop: '12px' }}
            >
              {mode === 'login' ? 'Sign In to PulsePoll' : 'Create Creator Account'}
            </Button>
          </form>

          {/* Social Sign-in Buttons */}
          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="social-auth-row">
            <Button
              type="button"
              variant="secondary"
              size="md"
              style={{ flex: 1 }}
              onClick={() => {
                handleFillDemo();
                if (showToast) showToast('Filled verified demo credentials! Click Sign In.');
              }}
              iconLeft={
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              }
            >
              Google Demo
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              style={{ flex: 1 }}
              onClick={() => {
                handleFillDemo();
                if (showToast) showToast('Filled verified demo credentials! Click Sign In.');
              }}
              iconLeft={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292F">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              }
            >
              GitHub Demo
            </Button>
          </div>

          <div className="auth-toggle-mode">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button type="button" className="auth-mode-link" onClick={() => { setMode('signup'); setError(''); }}>
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" className="auth-mode-link" onClick={() => { setMode('login'); setError(''); }}>
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
