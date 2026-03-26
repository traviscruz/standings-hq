import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/policy.css';
import '../../styles/public.css';

export default function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <Link to="/" className="policy-back">← Back to home</Link>
      
      <div className="policy-header">
        <h1 className="policy-title">Privacy Policy</h1>
        <div className="policy-meta">Last updated: March 2025</div>
      </div>
      
      <div className="policy-content">
        <p>At StandingsHQ, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform for managing competitions.</p>
        
        <h2>1. Information We Collect</h2>
        <p>We only collect the information necessary to provide our services and ensure a smooth experience for organizers, judges, and participants. This includes:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, and role (Organizer, Judge, Participant).</li>
          <li><strong>Event Data:</strong> Competition names, rubrics, and scores submitted by judges.</li>
          <li><strong>Participant Data:</strong> Names and performance metrics for generating certificates and leaderboards.</li>
        </ul>
        
        <h2>2. How We Use Your Information</h2>
        <p>Your data is strictly used for platform functionality:</p>
        <ul>
          <li>To authenticate users and provide role-based access.</li>
          <li>To process scores and maintain live leaderboards during events.</li>
          <li>To generate downloadable certificates.</li>
          <li>To notify users of account activities (e.g., password resets).</li>
        </ul>
        
        <h2>3. Data Protection</h2>
        <p>Your data is securely stored. We do not sell your personal information to third parties. Public event pages only display information explicitly approved by organizers.</p>
        
        <h2>4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@standingshq.edu.ph.</p>
      </div>
    </div>
  );
}
