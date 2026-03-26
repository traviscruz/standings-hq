import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/policy.css';
import '../../styles/public.css';

export default function TermsPage() {
  return (
    <div className="policy-page">
      <Link to="/" className="policy-back">← Back to home</Link>
      
      <div className="policy-header">
        <h1 className="policy-title">Terms of Service</h1>
        <div className="policy-meta">Last updated: March 2025</div>
      </div>
      
      <div className="policy-content">
        <p>Welcome to StandingsHQ. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By creating an account, you agree to these terms. StandingsHQ is designed for Philippine schools, universities, and student organizations.</p>
        
        <h2>2. Use of the Platform</h2>
        <p>You agree to use StandingsHQ only for lawful purposes. As an Organizer, you are responsible for the content, rubrics, and participant data you upload to the platform.</p>
        <ul>
          <li>You must not use the platform to process sensitive personal data unrelated to competitions.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        </ul>
        
        <h2>3. Public Access</h2>
        <p>Events published publicly will be accessible to anyone on the internet. Organizers should ensure they have the right to publish participant names and scores.</p>
        
        <h2>4. Service Limitations</h2>
        <p>While StandingsHQ strives for 100% uptime, especially during live events, the platform is provided "as is" without warranty of any kind. We are not liable for any disruptions during your event.</p>
        
        <h2>5. Changes to Terms</h2>
        <p>We may update these terms periodically. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
      </div>
    </div>
  );
}
