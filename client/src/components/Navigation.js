import React from 'react';
import './Navigation.css';

const Navigation = ({ onBack, showBack = true }) => {
  return (
    <nav className="page-navigation">
      <div className="nav-content">
        {showBack && (
          <button onClick={onBack} className="nav-back-btn">
            ← Back
          </button>
        )}
        <div className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 72 72" fill="none">
            <rect width="72" height="72" rx="16" fill="url(#navGradient)"/>
            <rect x="18" y="20" width="32" height="4" rx="2" fill="rgba(255,255,255,0.8)"/>
            <rect x="20" y="26" width="28" height="4" rx="2" fill="rgba(255,255,255,0.6)"/>
            <rect x="22" y="32" width="24" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
            <path d="M52 36c0-4-2-7-5-7s-5 3-5 7 2 7 5 7 5-3 5-7z" fill="#00D9FF" opacity="0.8"/>
            <defs>
              <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1C1C1E"/>
                <stop offset="100%" stopColor="#2C2C2E"/>
              </linearGradient>
            </defs>
          </svg>
          <span>ReadingStinks.com</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
