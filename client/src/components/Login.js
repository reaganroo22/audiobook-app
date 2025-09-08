import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = ({ onBack }) => {
  const { signInWithGoogle, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      {/* Background */}
      <div className="auth-bg-grid"></div>
      <div className="auth-bg-gradient"></div>
      
      {/* Back Button */}
      <button onClick={onBack} className="auth-back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Back
      </button>
      
      {/* Auth Content */}
      <div className={`auth-content ${isVisible ? 'visible' : ''}`}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="60" height="60" viewBox="0 0 72 72" fill="none">
              <rect width="72" height="72" rx="16" fill="url(#authGradient)"/>
              <rect x="18" y="20" width="32" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
              <rect x="20" y="26" width="28" height="4" rx="2" fill="rgba(255,255,255,0.7)"/>
              <rect x="22" y="32" width="24" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
              <path d="M52 36c0-4-2-7-5-7s-5 3-5 7 2 7 5 7 5-3 5-7z" fill="#007AFF" opacity="0.9"/>
              <path d="M58 36c0-7-3-12-8-12s-8 5-8 12 3 12 8 12 8-5 8-12z" stroke="#007AFF" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <defs>
                <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1C1C1E"/>
                  <stop offset="100%" stopColor="#2C2C2E"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">
            Continue with Google to save your audiobooks.
          </p>
        </div>

        <div className="auth-form">
          <button 
            onClick={handleGoogleSignIn}
            className="auth-button"
            disabled={loading}
          >
            <div className="auth-button-content">
              <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </div>
            <div className="auth-button-bg"></div>
          </button>

        </div>

        <div className="auth-footer">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;