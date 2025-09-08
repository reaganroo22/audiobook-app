import React, { useState, useEffect } from 'react';

const LandingPage = ({ onGetStarted, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
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
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="#1C1C1E" stroke="#FFFFFF" strokeWidth="1"/>
              <rect x="10" y="18" width="12" height="2" rx="1" fill="#FFFFFF" opacity="0.9"/>
              <rect x="10" y="22" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.7"/>
              <rect x="10" y="26" width="14" height="2" rx="1" fill="#FFFFFF" opacity="0.5"/>
              <rect x="10" y="30" width="18" height="2" rx="1" fill="#FFFFFF" opacity="0.3"/>
              <circle cx="33" cy="24" r="3" fill="#FFFFFF" opacity="0.9"/>
              <path d="M33 21v6M30 22.5v3M36 22.5v3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="logo-text">AudioDocs</span>
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
              <strong>Free for Georgetown students!</strong>
              <br/>Use your @georgetown.edu email to get unlimited access.
              <br/><br/>
              For everyone else: Try your first document free, then pay per conversion.
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
            <span className="footer-logo">AudioDocs</span>
            <p>Convert PDFs to audio</p>
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