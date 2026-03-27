import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ background: '#3B82F6', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12.5" cy="5" r="2" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'DM Sans', fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Standings<span style={{ color: '#3B82F6' }}>HQ</span></span>
        </Link>
        <div style={{ fontSize: '180px', fontWeight: 900, color: 'rgba(255,255,255,0.05)', lineHeight: 1, letterSpacing: '-0.05em', marginBottom: '-40px' }}>404</div>
        <div style={{ 
          display: 'inline-flex', padding: '6px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '100px',
          fontSize: '12px', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px'
        }}>
          Page Not Found
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px', color: '#fff' }}>Out of Bounds</h1>
        <p style={{ fontSize: '18px', color: '#94A3B8', maxWidth: '500px', lineHeight: 1.6, marginBottom: '40px' }}>
          It seems you've wandered into an unjudged territory. The page you're looking for doesn't exist or has been archived.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/" style={{ padding: '14px 32px', background: '#3B82F6', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
            Go Back Home
          </Link>
          <Link to="/login" style={{ padding: '14px 32px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
            Member Login
          </Link>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', fontSize: '14px', color: '#475569' }}>
        StandingsHQ · Error Reference ID: SHQ-404-LIVE
      </div>
    </div>
  );
}
