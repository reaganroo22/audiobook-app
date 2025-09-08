import React from 'react';
import Navigation from './Navigation';
import './TermsOfService.css';

const TermsOfService = ({ onBack }) => {
  return (
    <div className="legal-page">
      <Navigation onBack={onBack} />
      <div className="legal-header">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using our audiobook conversion service, you accept and agree to be bound 
            by the terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Our service provides document-to-audiobook conversion capabilities, allowing users to:
          </p>
          <ul>
            <li>Upload documents in various formats (PDF, Word, text files)</li>
            <li>Convert documents into high-quality audio content</li>
            <li>Access and manage their converted audiobooks</li>
            <li>Download audio files for offline listening</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            To use our service, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to use our service to:</p>
          <ul>
            <li>Upload content that violates intellectual property rights</li>
            <li>Process illegal, harmful, or offensive material</li>
            <li>Attempt to reverse engineer or compromise our systems</li>
            <li>Use the service for commercial purposes without authorization</li>
            <li>Share your account with others</li>
            <li>Upload content that contains malware or malicious code</li>
          </ul>
        </section>

        <section>
          <h2>5. Content Ownership and Rights</h2>
          <p>
            You retain ownership of the documents you upload. By using our service, you grant us 
            a limited license to process your content solely for the purpose of providing our 
            conversion services. We do not claim ownership of your content.
          </p>
          <p>
            You are responsible for ensuring you have the right to upload and process any content 
            you submit to our service.
          </p>
        </section>

        <section>
          <h2>6. Payment and Billing</h2>
          <p>
            Our service operates on a pay-per-use model:
          </p>
          <ul>
            <li>First document conversion is free</li>
            <li>Subsequent conversions are charged per document</li>
            <li>All fees are clearly displayed before processing</li>
            <li>Payments are processed securely through our payment partners</li>
            <li>No refunds for completed conversions</li>
          </ul>
        </section>

        <section>
          <h2>7. Service Availability</h2>
          <p>
            We strive to maintain high service availability but cannot guarantee uninterrupted access. 
            We may temporarily suspend service for maintenance, updates, or technical issues. We are 
            not liable for any downtime or service interruptions.
          </p>
        </section>

        <section>
          <h2>8. Data Retention and Deletion</h2>
          <p>
            We retain your data as follows:
          </p>
          <ul>
            <li>Account information: Until you delete your account</li>
            <li>Uploaded documents: Temporarily during processing, then deleted</li>
            <li>Generated audio files: Until you delete them or close your account</li>
            <li>Usage logs: For up to 12 months for service improvement</li>
          </ul>
          <p>
            You can delete your content and account at any time through your account settings.
          </p>
        </section>

        <section>
          <h2>9. Intellectual Property</h2>
          <p>
            Our service, including its design, functionality, and underlying technology, is protected 
            by intellectual property laws. You may not copy, modify, or distribute our service or 
            its components without written permission.
          </p>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages, including but not limited to 
            loss of profits, data, or use, arising from your use of our service.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violation of these terms. 
            You may terminate your account at any time. Upon termination, your right to use the 
            service ceases immediately, and we may delete your data.
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of 
            material changes via email or through the service. Continued use after changes 
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of [Your Jurisdiction], 
            without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2>14. Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <p>
            Email: legal@readingsucks.com<br />
            Address: [Your Business Address]
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
