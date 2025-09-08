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
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1C1C1E"/>
                <stop offset="50%" stopColor="#2C2C2E"/>
                <stop offset="100%" stopColor="#3A3A3C"/>
              </linearGradient>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill="url(#navGradient)" stroke="#FFFFFF" strokeWidth="1"/>
            <rect x="10" y="18" width="12" height="2" rx="1" fill="url(#waveGradient)"/>
            <rect x="10" y="22" width="16" height="2" rx="1" fill="url(#waveGradient)"/>
            <rect x="10" y="26" width="14" height="2" rx="1" fill="url(#waveGradient)"/>
            <rect x="10" y="30" width="18" height="2" rx="1" fill="url(#waveGradient)"/>
            <circle cx="33" cy="24" r="3" fill="#FFFFFF" opacity="0.9"/>
            <path d="M33 21v6M30 22.5v3M36 22.5v3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Reading Stinks</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
