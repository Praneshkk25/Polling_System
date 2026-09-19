import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Sparkles, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { validateEmail, validatePassword, getPasswordStrength, checkPasswordCriteria } from '../utils/validation';

export default function AuthModal({ isOpen, onClose, showToast }) {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Field-level error messages
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  if (!isOpen) return null;

  const passwordCriteria = checkPasswordCriteria(password);
  const passwordStrength = getPasswordStrength(password);

  const resetFormState = (newMode) => {
    setIsSignup(newMode);
    setError('');
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setTouched({ name: false, email: false, password: false });
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (touched.email) {
      const res = validateEmail(val);
      setEmailError(res.isValid ? '' : res.error);
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const res = validateEmail(email);
    setEmailError(res.isValid ? '' : res.error);
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (touched.password) {
      const res = validatePassword(val, isSignup);
      setPasswordError(res.isValid ? '' : res.error);
    }
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    const res = validatePassword(password, isSignup);
    setPasswordError(res.isValid ? '' : res.error);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (touched.name) {
      setNameError(val.trim().length >= 2 ? '' : 'Name must be at least 2 characters');
    }
  };

  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
    setNameError(name.trim().length >= 2 ? '' : 'Name must be at least 2 characters');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    // Mark all as touched
    setTouched({ name: true, email: true, password: true });

    // Validate fields
    if (isSignup && name.trim().length < 2) {
      setNameError('Please enter your full name (at least 2 characters)');
      setError('Please fill in all required fields properly');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setEmailError(emailVal.error);
      setError(emailVal.error);
      return;
    }

    const passVal = validatePassword(password, isSignup);
    if (!passVal.isValid) {
      setPasswordError(passVal.error);
      setError(passVal.error);
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await signup(name.trim(), email.trim(), password);
        if (showToast) showToast('Account created successfully! 🎉');
      } else {
        await login(email.trim(), password);
        if (showToast) showToast('Welcome back! 👋');
      }
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    if (loading) return;
    setError('');
    setEmailError('');
    setPasswordError('');
    setLoading(true);
    try {
      await login('pranesh@pulsepoll.io', 'Password123!');
      if (showToast) showToast('Logged in as Pranesh (Creator) 👋');
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to login with demo credentials');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ width: '460px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
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
              onClick={() => resetFormState(false)}
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
              onClick={() => resetFormState(true)}
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-input ${nameError ? 'input-error' : ''}`}
                  placeholder="e.g. Pranesh"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleNameBlur}
                  required
                />
                {nameError && (
                  <span style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    {nameError}
                  </span>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${emailError ? 'input-error' : ''}`}
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                required
              />
              {emailError && (
                <span style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  {emailError}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input password-field ${passwordError ? 'input-error' : ''}`}
                  placeholder={isSignup ? 'Create secure password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={handlePasswordBlur}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <span style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  {passwordError}
                </span>
              )}

              {/* Password Strength Meter & Checklist in Signup mode */}
              {isSignup && (
                <div style={{ marginTop: '10px', background: '#F9FAFB', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#4B5563' }}>Password Strength</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: passwordStrength.textColor }}>
                      {password ? passwordStrength.label : 'None'}
                    </span>
                  </div>

                  {/* Visual Strength Progress Bar */}
                  <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        style={{
                          flex: 1,
                          height: '100%',
                          borderRadius: '2px',
                          background: passwordStrength.score >= step ? passwordStrength.color : '#E5E7EB',
                          transition: 'background 0.3s ease',
                        }}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordCriteria.minLength ? '#059669' : '#9CA3AF' }}>
                      <Check size={12} strokeWidth={passwordCriteria.minLength ? 3 : 2} />
                      <span>8+ characters</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordCriteria.hasUpper ? '#059669' : '#9CA3AF' }}>
                      <Check size={12} strokeWidth={passwordCriteria.hasUpper ? 3 : 2} />
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordCriteria.hasLower ? '#059669' : '#9CA3AF' }}>
                      <Check size={12} strokeWidth={passwordCriteria.hasLower ? 3 : 2} />
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordCriteria.hasNumber ? '#059669' : '#9CA3AF' }}>
                      <Check size={12} strokeWidth={passwordCriteria.hasNumber ? 3 : 2} />
                      <span>Number (0-9)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordCriteria.hasSpecial ? '#059669' : '#9CA3AF', gridColumn: 'span 2' }}>
                      <Check size={12} strokeWidth={passwordCriteria.hasSpecial ? 3 : 2} />
                      <span>Special symbol (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px' }}>
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

