import React, { useState } from 'react';
import Navigation from './Navigation';
import './Support.css';

const Support = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="support-page">
        <Navigation onBack={onBack} />
        <div className="support-header">
          <h1>Support</h1>
        </div>
        
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Message Sent!</h2>
          <p>
            Thank you for contacting us. We've received your message and will get back to you 
            within 24 hours.
          </p>
          <button onClick={() => setSubmitted(false)} className="send-another-btn">
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      <Navigation onBack={onBack} />
      <div className="support-header">
        <h1>Support</h1>
        <p className="support-subtitle">We're here to help you with any questions or issues</p>
      </div>

      <div className="support-content">
        <div className="support-grid">
          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send us a message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Please provide as much detail as possible about your question or issue..."
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-item">
              <h3>What file formats do you support?</h3>
              <p>
                We support PDF, Word documents (.docx), and plain text files (.txt). 
                We're working on adding support for more formats.
              </p>
            </div>

            <div className="faq-item">
              <h3>How long does conversion take?</h3>
              <p>
                Most documents are processed within 2-5 minutes. Larger documents 
                or those with complex formatting may take longer.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I download my audiobooks?</h3>
              <p>
                Yes! You can download your converted audiobooks in MP3 format for 
                offline listening on any device.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is my first conversion really free?</h3>
              <p>
                Absolutely! Your first document conversion is completely free with 
                no credit card required.
              </p>
            </div>

            <div className="faq-item">
              <h3>What languages are supported?</h3>
              <p>
                We currently support English, Spanish, French, German, and Italian. 
                More languages are being added regularly.
              </p>
            </div>

            <div className="faq-item">
              <h3>How do I delete my account?</h3>
              <p>
                You can delete your account and all associated data from your account 
                settings page. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="contact-info">
          <h2>Other ways to reach us</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <div className="contact-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>support@audiodocs.com</p>
                <span>We respond within 24 hours</span>
              </div>
            </div>
            
            <div className="contact-method">
              <div className="contact-icon">💬</div>
              <div>
                <h3>Live Chat</h3>
                <p>Available 9 AM - 6 PM EST</p>
                <span>Click the chat icon in the bottom right</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
