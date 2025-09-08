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
            <circle cx="24" cy="24" r="22" fill="#1C1C1E" stroke="#FFFFFF" strokeWidth="1"/>
            <rect x="10" y="18" width="12" height="2" rx="1" fill="#FFFFFF" opacity="0.9"/>
            <rect x="10" y="22" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.7"/>
            <rect x="10" y="26" width="14" height="2" rx="1" fill="#FFFFFF" opacity="0.5"/>
            <rect x="10" y="30" width="18" height="2" rx="1" fill="#FFFFFF" opacity="0.3"/>
            <circle cx="33" cy="24" r="3" fill="#FFFFFF" opacity="0.9"/>
            <path d="M33 21v6M30 22.5v3M36 22.5v3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>AudioDocs</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
