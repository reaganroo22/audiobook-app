import React, { useState, useEffect } from 'react';

const LandingPage = ({ onGetStarted, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="landing-container">
      {/* Background */}
      <div className="landing-bg-grid"></div>
      <div className="landing-bg-gradient"></div>
      
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <svg width="40" height="40" viewBox="0 0 72 72" fill="none">
              <rect width="72" height="72" rx="16" fill="url(#logoGradient)"/>
              <rect x="18" y="20" width="32" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
              <rect x="20" y="26" width="28" height="4" rx="2" fill="rgba(255,255,255,0.7)"/>
              <rect x="22" y="32" width="24" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
              <path d="M52 36c0-4-2-7-5-7s-5 3-5 7 2 7 5 7 5-3 5-7z" fill="#007AFF" opacity="0.9"/>
              <path d="M58 36c0-7-3-12-8-12s-8 5-8 12 3 12 8 12 8-5 8-12z" stroke="#007AFF" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1C1C1E"/>
                  <stop offset="100%" stopColor="#2C2C2E"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">Audiobook</span>
          </div>
          <button onClick={onGetStarted} className="header-cta">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`hero-section ${isVisible ? 'visible' : ''}`}>
        <div className="hero-content">
          <h1 className="hero-title">
            Listen to documents
          </h1>
          
          <p className="hero-subtitle">
            Upload any PDF, Word doc, or text file.
            <br />Get back high-quality audio you can listen to anywhere.
          </p>
          
          <button onClick={onGetStarted} className="primary-cta">
            Convert your first document
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-content">
          <div className="features-grid">
            <div className="feature-item">
              <h3>Works with everything</h3>
              <p>PDFs, Word docs, research papers, ebooks. Even scanned documents.</p>
            </div>
            
            <div className="feature-item">
              <h3>Sounds natural</h3>
              <p>Clear, human-like voices. Multiple languages and speeds available.</p>
            </div>
            
            <div className="feature-item">
              <h3>Smart organization</h3>
              <p>Automatically breaks long documents into chapters and sections.</p>
            </div>
            
            <div className="feature-item">
              <h3>Ready quickly</h3>
              <p>Most documents processed in under 5 minutes. No waiting around.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing */}
      <section className="pricing-section">
        <div className="section-content">
          <div className="pricing-card">
            <h2>Simple pricing</h2>
            <p className="price-description">
              Try your first document completely free.
              <br/>Then pay only for what you convert.
            </p>
            <button onClick={onGetStarted} className="pricing-cta">
              Get started free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">Audiobook</span>
            <p>Convert PDFs to audiobooks</p>
          </div>
          
          <div className="footer-links">
            <button 
              onClick={() => window.location.href = '/privacy'}
              className="footer-link"
            >
              Privacy
            </button>
            <button 
              onClick={() => window.location.href = '/terms'}
              className="footer-link"
            >
              Terms
            </button>
            <button 
              onClick={() => window.location.href = '/support'}
              className="footer-link"
            >
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;