import React from 'react';
import { Link } from 'react-router-dom';

export default function ArchivePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFDFD', paddingBottom: '100px', fontFamily: 'Inter, sans-serif' }}>
      {/* Public Navigation */}
      <header style={{ 
        background: '#fff', 
        borderBottom: '1px solid #F1F5F9', 
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: '#0F1F3D', width: '30px', height: '30px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12.5" cy="5" r="2" fill="#3B82F6"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'DM Sans', fontSize: '18px', fontWeight: 800, color: '#0F1F3D', letterSpacing: '-0.03em' }}>Standings<span style={{ color: '#3B82F6' }}>HQ</span> <span style={{ color: '#64748B', fontWeight: 600, fontSize: '14px', marginLeft: '4px' }}>Archive</span></span>
        </Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/leaderboard" style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', textDecoration: 'none' }}>Live Standings</Link>
          <Link to="/login" style={{ padding: '8px 20px', background: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Portal Login</Link>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 24px' }}>
        {/* Article Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.05em' }}>
           <span>Home</span> <span>/</span> <span>Archives</span> <span>/</span> <span style={{ color: '#3B82F6' }}>Event Recap</span>
        </div>

        {/* Article Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '4px 12px', 
            background: '#F1F5F9', 
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#475569',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            Featured Completion · Science & Technology
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
            InnovateMNL: The 2025 National Robotics & AI Symposium Final Results
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748B', fontSize: '14px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>calendar_today</span>
                Published Dec 12, 2025
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>location_on</span>
                Manila International Expo
             </div>
          </div>
        </div>

        {/* Featured Image Placeholder */}
        <div style={{ 
          width: '100%', 
          aspectRatio: '16/9', 
          background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', 
          borderRadius: '24px', 
          marginBottom: '48px',
          display: 'grid',
          placeItems: 'center',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
           <div style={{ textAlign: 'center', color: '#94A3B8' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '120px', marginBottom: '12px' }}>photo_library</span>
              <div style={{ fontWeight: 600 }}>Event Gallery · 42 Official Photos</div>
           </div>
        </div>

        {/* Article Body */}
        <div style={{ fontSize: '18px', color: '#334155', lineHeight: 1.8, marginBottom: '60px' }}>
          <p style={{ marginBottom: '24px', fontWeight: 500 }}>
            After three days of intense competition, technical assessments, and live demonstrations, the InnovateMNL 2025 National Robotics Symposium has officially concluded. This year’s event saw a record-breaking 1,200 participants from 85 schools across the archipelago, showcasing the next generation of industrial automation and artificial intelligence.
          </p>
          
          <p style={{ marginBottom: '24px' }}>
            The final round, held at the Grand Hall, featured the top 12 teams in a head-to-head challenge involving "Autonomous Disaster Response." Judges noted that the level of precision and algorithm efficiency reached new heights this year. <strong>Team BitBuster</strong>, representing Quezon City Technical Institute, delivered a flawless performance in the final segment, securing their spot as the 2025 Grand Champion.
          </p>

          <blockquote style={{ 
            margin: '40px 0', 
            paddingLeft: '32px', 
            borderLeft: '4px solid #3B82F6', 
            fontStyle: 'italic', 
            fontSize: '22px', 
            fontWeight: 500, 
            color: '#0F172A',
            lineHeight: 1.5
          }}>
            "The synergy between hardware robustness and software intelligence displayed this year was simply world-class. These students aren't just building robots; they are engineering solutions for the future of our nation."
            <footer style={{ fontSize: '14px', color: '#64748B', marginTop: '12px', fontStyle: 'normal', fontWeight: 700 }}>
              — Dr. Elena Reyes, Head of the Judging Panel
            </footer>
          </blockquote>

          <p style={{ marginBottom: '24px' }}>
            Beyond the robotics competition, the symposium hosted series of seminars and workshop tracks. StandingsHQ was proud to provide the official real-time scoring and certified result publication for the entire duration of the event, ensuring that every point was tracked with 100% transparency and precision.
          </p>
        </div>

        {/* Results Sidebar / Summary */}
        <div style={{ background: '#0F172A', borderRadius: '32px', padding: '48px', color: '#fff', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Official Standings</div>
              <h3 style={{ fontSize: '32px', fontWeight: 800 }}>InnovateMNL 2025 Champion</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>FINAL SCORE</div>
               <div style={{ fontSize: '36px', fontWeight: 900, color: '#4ADE80' }}>98.24</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥇</div>
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>Team BitBuster</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>QC Technical Institute</div>
                <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '16px', color: '#4ADE80' }}>1ST PLACE</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥈</div>
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>CodeCrafters</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Science Unified Academy</div>
                <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '16px', color: '#94A3B8' }}>2ND PLACE</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥉</div>
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>RoboKinetics</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Regional Science High</div>
                <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '16px', color: '#94A3B8' }}>3RD PLACE</div>
             </div>
          </div>
          
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Certified Results by StandingsHQ Verification Engine</div>
             <Link to="/leaderboard" style={{ padding: '12px 24px', background: '#3B82F6', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                View Full Score Breakdown
             </Link>
          </div>
        </div>
      </main>

      <footer style={{ background: '#fff', borderTop: '1px solid #F1F5F9', padding: '60px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#94A3B8' }}>&copy; 2026 StandingsHQ Archive · Built for Transparency in Every Score.</p>
      </footer>
    </div>
  );
}
