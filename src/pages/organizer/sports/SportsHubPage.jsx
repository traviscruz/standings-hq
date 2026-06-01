import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../styles/colors';

const FEATURES = [
  {
    icon: 'auto_awesome',
    title: 'AI Sports Builder',
    description: 'Describe any sport and Claude generates the full scoring sheet blueprint automatically.',
    action: 'Get Started',
    path: '/organizer/sports/new',
    accent: colors.accent,
  },
  {
    icon: 'calendar_month',
    title: 'My Sports Events',
    description: 'View and manage all your configured sports competitions.',
    action: 'View Events',
    path: '/organizer/sports/events',
    accent: '#7A5C8A',
  },
  {
    icon: 'bracket',
    title: 'Brackets',
    description: 'View bracket trees across all your sports events.',
    action: 'View Brackets',
    path: '/organizer/sports/brackets',
    accent: colors.success,
  },
];

export default function SportsHubPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)`,
        borderRadius: '28px', padding: '48px 40px', marginBottom: '32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
          <span className="material-symbols-rounded" style={{ fontSize: '200px', color: '#fff' }}>sports</span>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', width: '44px', height: '44px', display: 'grid', placeItems: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px', color: '#fff' }}>sports</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>StandingsHQ Sports</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            Sports Hub
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', margin: '0 0 28px', lineHeight: 1.6, maxWidth: '480px' }}>
            AI-powered dynamic scoring sheets for any sport. Describe the competition — Claude generates the blueprint. The renderer handles the rest.
          </p>
          <button
            onClick={() => navigate('/organizer/sports/new')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', background: '#fff', color: colors.navy,
              border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800',
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>rocket_launch</span>
            Configure a Sports Event
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {FEATURES.map(f => (
          <div
            key={f.path}
            onClick={() => navigate(f.path)}
            style={{
              background: '#fff', borderRadius: '20px', padding: '24px',
              border: `1px solid ${colors.borderSoft}`, cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = f.accent + '40';
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(15,23,42,0.08)`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = colors.borderSoft;
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: f.accent + '15', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '22px', color: f.accent }}>{f.icon}</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.navy, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>{f.title}</h3>
            <p style={{ fontSize: '13px', color: colors.inkMuted, margin: '0 0 20px', lineHeight: 1.5 }}>{f.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: f.accent }}>
              {f.action}
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>arrow_forward</span>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div style={{ marginTop: '40px', background: '#fff', borderRadius: '20px', padding: '32px', border: `1px solid ${colors.borderSoft}` }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.navy, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>How It Works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { step: 1, text: 'Create your event using the normal event creation flow (existing).' },
            { step: 2, text: 'Add participants and assign them to teams using the Participants page.' },
            { step: 3, text: 'Invite 1 scorer via the Judges page. Sports events use 1 scorer by default.' },
            { step: 4, text: 'Go to Sports Builder → select the event → describe the sport → AI generates the scoring blueprint.' },
            { step: 5, text: 'Review and confirm the configuration. Teams auto-populate from participant data.' },
            { step: 6, text: 'Scorer logs in and navigates to Sports Scoring to start recording match events.' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.accentBg, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '13px', fontWeight: '700', color: colors.accent }}>{step}</div>
              <p style={{ fontSize: '13px', color: colors.inkSoft, margin: 0, paddingTop: '4px', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
