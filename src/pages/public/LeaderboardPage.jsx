import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SAMPLE_EVENT = {
  name: 'Metro Manila Debate Open',
  type: 'Academic Competition',
  startDate: '2026-10-15',
  participants: [
    { id: 1, name: 'Antonio Luna', team: 'Sharpshooters', score: 94.2, rank: 1, trend: 'up', barangay: 'Brgy 001' },
    { id: 2, name: 'Maria Santos', team: 'La Solidaridad', score: 91.0, rank: 2, trend: 'up', barangay: 'Brgy 002' },
    { id: 3, name: 'Jose Rizal', team: 'The Enlightened', score: 88.5, rank: 3, trend: 'down', barangay: 'Brgy 003' },
    { id: 4, name: 'Gabriela Silang', team: 'Team Alpha', score: 87.5, rank: 4, trend: 'stable', barangay: 'Brgy 004' },
    { id: 5, name: 'Andres Bonifacio', team: 'Magdiwang', score: 82.0, rank: 5, trend: 'up', barangay: 'Brgy 005' },
    { id: 6, name: 'Emilio Aguinaldo', team: 'Magdalo', score: 79.5, rank: 6, trend: 'down', barangay: 'Brgy 006' },
    { id: 7, name: 'Marcelo Del Pilar', team: 'The Propagandist', score: 76.2, rank: 7, trend: 'stable', barangay: 'Brgy 007' }
  ],
  judges: ['Dingdong Dantes', 'Marian Rivera', 'Sarah Geronimo'],
  location: 'UP Diliman, Quezon City'
};

export default function LeaderboardPage() {
  const [syncTime, setSyncTime] = useState(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setSyncTime(new Date().toLocaleTimeString());
        setIsSyncing(false);
      }, 1000);
    }, 15000); // Sync every 15s
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Live Header */}
      <header style={{ 
        background: '#0F172A', 
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ background: '#3B82F6', width: '38px', height: '38px', borderRadius: '10px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12.5" cy="5" r="2.2" fill="#fff"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'DM Sans', display: 'block', letterSpacing: '-0.03em' }}>Standings<span style={{ color: '#3B82F6' }}>HQ</span></span>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '-2px' }}>Live Leaderboard</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>LAST SYNC</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{syncTime} {isSyncing && <span style={{ color: '#3B82F6', fontSize: '10px', marginLeft: '4px' }}>Updating...</span>}</div>
          </div>
          <Link to="/login" style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Portal Login</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: '#1E293B', padding: '60px 40px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '6px 16px', 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#4ADE80',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', display: 'block', animation: 'pulse 1.5s infinite' }} />
            Live Scoring in Progress
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '12px' }}>{SAMPLE_EVENT.name}</h1>
          <p style={{ fontSize: '18px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto' }}>Tracking technical excellence across multiple rounds of argumentation and logic.</p>
        </div>
        
        {/* Background Elements */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </section>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '-60px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px' }}>
          {/* Active Leaderboard */}
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Performance Statistics</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ padding: '6px 12px', background: '#F1F5F9', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>Category: {SAMPLE_EVENT.type}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Rank</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Participant</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Team</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Avg Score</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_EVENT.participants.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '10px', display: 'grid', placeItems: 'center', fontSize: '14px', fontWeight: 800,
                        background: p.rank === 1 ? '#FEF3C7' : p.rank === 2 ? '#F1F5F9' : p.rank === 3 ? '#FFEDD5' : 'transparent',
                        color: p.rank === 1 ? '#92400E' : p.rank === 2 ? '#475569' : p.rank === 3 ? '#9A3412' : '#64748B',
                        border: p.rank > 3 ? '1px solid #E2E8F0' : 'none'
                      }}>
                        {p.rank}
                      </div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{p.barangay}</div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontSize: '14px', color: '#64748B' }}>{p.team}</div>
                    </td>
                    <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#3B82F6' }}>{p.score}</div>
                    </td>
                    <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                      <span className="material-symbols-rounded" style={{ 
                        color: p.trend === 'up' ? '#22C55E' : p.trend === 'down' ? '#EF4444' : '#94A3B8',
                        fontSize: '20px'
                      }}>
                        {p.trend === 'up' ? 'trending_up' : p.trend === 'down' ? 'trending_down' : 'trending_flat'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Sync Info */}
            <div style={{ background: '#0F172A', borderRadius: '24px', padding: '24px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="material-symbols-rounded" style={{ color: '#3B82F6' }}>analytics</span>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Scoring Insights</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Verified Judges</div>
                  <div style={{ fontSize: '15px', color: '#fff', marginTop: '4px' }}>{SAMPLE_EVENT.judges.length} Official Judges</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Current Stage</div>
                  <div style={{ fontSize: '15px', color: '#fff', marginTop: '4px' }}>Final Rebuttal Round</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontSize: '15px', color: '#fff', marginTop: '4px' }}>{SAMPLE_EVENT.location}</div>
                </div>
              </div>
            </div>

            {/* Judging Panel */}
            <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>gavel</span>
                Judging Panel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {SAMPLE_EVENT.judges.map(judge => (
                  <div key={judge} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{judge}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick QR/Share Placeholder */}
            <div style={{ background: '#F1F5F9', border: '2px dashed #CBD5E1', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: '#94A3B8', marginBottom: '12px' }}>qr_code_2</span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Scan to share results</div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
