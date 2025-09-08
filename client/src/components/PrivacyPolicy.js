import React from 'react';
import Navigation from './Navigation';
import './PrivacyPolicy.css';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="legal-page">
      <Navigation onBack={onBack} />
      <div className="legal-header">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            upload documents, or contact us for support. This may include:
          </p>
          <ul>
            <li>Email address and authentication information</li>
            <li>Documents you upload for processing</li>
            <li>Usage data and preferences</li>
            <li>Communication records when you contact support</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and improve our audiobook conversion services</li>
            <li>Process your documents and generate audio content</li>
            <li>Communicate with you about your account and our services</li>
            <li>Provide customer support</li>
            <li>Ensure the security and integrity of our platform</li>
          </ul>
        </section>

        <section>
          <h2>3. Document Processing and Storage</h2>
          <p>
            When you upload documents to our service:
          </p>
          <ul>
            <li>Documents are processed to extract text and generate audio</li>
            <li>We temporarily store your documents during processing</li>
            <li>Generated audio files are stored for your access</li>
            <li>You can delete your content at any time through your account</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties, 
            except in the following circumstances:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. This includes:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure data centers and infrastructure</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of certain communications</li>
            <li>Request information about how your data is used</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
            and provide personalized content. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect personal 
            information from children under 13. If we become aware of such collection, we will take 
            steps to delete the information.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material 
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p>
            Email: privacy@readingstinks.com<br />
            Address: [Your Business Address]
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
