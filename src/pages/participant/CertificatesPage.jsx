import React, { useState } from 'react';
import { useParticipantContext } from './ParticipantLayout';

// Shared styling from Organizer Certificate Builder for uniformity
const BORDER_TEMPLATES = [
  { id: 'classic',   name: 'Classic Gold',    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '#D4AF37', accent: '#D4AF37' },
  { id: 'navy',      name: 'Navy Royal',      bg: 'linear-gradient(135deg, #0F1F3D 0%, #1A3460 100%)', border: 'rgba(59,130,246,0.8)', accent: '#60A5FA' },
  { id: 'sage',      name: 'Emerald Prestige',bg: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', border: 'rgba(52,211,153,0.5)', accent: '#6EE7B7' },
  { id: 'crimson',   name: 'Crimson Honor',   bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', border: 'rgba(252,165,165,0.4)', accent: '#FCA5A5' },
];

const CSSCertificate = ({ achievement, eventName, date, size = 'medium' }) => {
  const isLarge = size === 'large';
  // Simplified matching for participant view
  const template = achievement === 'Champion' ? BORDER_TEMPLATES[0] : BORDER_TEMPLATES[1];
  
  return (
    <div style={{ 
      background: template.bg, 
      padding: isLarge ? '48px 48px' : '24px', 
      border: `4px solid ${template.border}`, 
      borderRadius: '16px', 
      minHeight: isLarge ? '400px' : '200px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      position: 'relative',
      boxShadow: isLarge ? '0 20px 40px rgba(0,0,0,0.3)' : 'none'
    }}>
      {/* Decorative corners */}
      {['0 0', '0 auto', 'auto 0', 'auto auto'].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', top: i < 2 ? '12px' : undefined, bottom: i >= 2 ? '12px' : undefined, left: i % 2 === 0 ? '12px' : undefined, right: i % 2 === 1 ? '12px' : undefined, width: isLarge ? '28px' : '12px', height: isLarge ? '28px' : '12px', border: `2px solid ${template.border}`, borderRadius: '2px', opacity: 0.4 }} />
      ))}

      <div style={{ fontSize: isLarge ? '11px' : '8px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: template.accent, marginBottom: isLarge ? '12px' : '8px', opacity: 0.9 }}>
        StandingsHQ · Certificate of Achievement
      </div>

      <div style={{ fontSize: isLarge ? '13px' : '10px', color: 'rgba(255,255,255,0.6)', marginBottom: isLarge ? '18px' : '8px' }}>
        This is to certify that
      </div>

      <div style={{ fontSize: isLarge ? '32px' : '18px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#fff', marginBottom: isLarge ? '18px' : '8px', borderBottom: `1px solid ${template.border}`, paddingBottom: isLarge ? '14px' : '6px', minWidth: isLarge ? '200px' : '120px', opacity: 0.97 }}>
        Riley Cruz
      </div>

      <div style={{ fontSize: isLarge ? '12.5px' : '9px', color: 'rgba(255,255,255,0.75)', maxWidth: isLarge ? '480px' : '200px', lineHeight: 1.8, marginBottom: isLarge ? '32px' : '16px' }}>
        In recognition of the exemplary excellence and outstanding achievement shown in {achievement} at the {eventName}.
      </div>

      {/* Signatories */}
      <div style={{ display: 'flex', gap: isLarge ? '48px' : '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: isLarge ? '120px' : '60px' }}>
          <div style={{ width: '100%', borderTop: `1px solid ${template.border}`, marginBottom: '8px', opacity: 0.5 }} />
          <div style={{ fontSize: isLarge ? '12px' : '8px', fontWeight: 700, color: '#fff', opacity: 0.9 }}>Juan Dela Cruz</div>
          <div style={{ fontSize: isLarge ? '10px' : '7px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Event Organizer</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: isLarge ? '120px' : '60px' }}>
          <div style={{ width: '100%', borderTop: `1px solid ${template.border}`, marginBottom: '8px', opacity: 0.5 }} />
          <div style={{ fontSize: isLarge ? '12px' : '8px', fontWeight: 700, color: '#fff', opacity: 0.9 }}>Maria Santos</div>
          <div style={{ fontSize: isLarge ? '10px' : '7px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Head Judge</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: isLarge ? '18px' : '8px', right: isLarge ? '18px' : '8px', fontSize: isLarge ? '10px' : '7px', color: 'rgba(255,255,255,0.3)' }}>
        {eventName} · {date}
      </div>
    </div>
  );
};

export default function CertificatesPage() {
  const { certificates, showToast } = useParticipantContext();
  const [selectedCert, setSelectedCert] = useState(null);

  const handleDownload = (name) => {
    showToast(`Downloading ${name} certificate as high-res PDF...`, 'success');
  };

  return (
    <div className="certificates-view">
      <header className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>workspace_premium</span>
            Achievement Vault
          </div>
          <h1 className="page-title">Certificates & Awards</h1>
          <p className="page-description">Manage and download your official performance credentials for all past competitions.</p>
        </div>
        <div className="header-actions">
           <button className="btn-outline" onClick={() => showToast('Syncing certificates...', 'success')}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>sync</span>
            Refresh List
          </button>
        </div>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '32px' }}>Certificate</th>
              <th>Competition</th>
              <th>Issue Date</th>
              <th style={{ textAlign: 'right', paddingRight: '32px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => (
              <tr key={cert.id} style={{ transition: 'background 0.2s' }}>
                <td style={{ padding: '24px 16px 24px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--navy)', display: 'grid', placeItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '20px' }}>workspace_premium</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>{cert.achievement}</div>
                  </div>
                </td>
                <td style={{ fontSize: '14px', color: 'var(--ink-soft)', fontWeight: 500 }}>{cert.eventName}</td>
                <td style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{cert.date}</td>
                <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setSelectedCert(cert)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>visibility</span>
                        View
                      </button>
                      <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => handleDownload(cert.eventName)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
                        Download
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {certificates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 32px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--border)', marginBottom: '16px', display: 'block' }}>inventory_2</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>No Certificates Earned</h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Complete your first event to receive an official certificate.</p>
          </div>
        )}
      </div>

      {/* Viewing Modal (Simple Inline Modal) */}
      {selectedCert && (
        <div 
          onClick={(e) => { if(e.target === e.currentTarget) setSelectedCert(null); }}
          style={{
            position: 'fixed', inset: 0, 
            background: 'rgba(15, 31, 61, 0.6)', 
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: '40px',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
        >
           <div 
             className="card" 
             style={{ 
               width: '100%', 
               maxWidth: '700px', 
               padding: '40px', 
               position: 'relative',
               animation: 'modalUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
             }}
           >
              <button 
                onClick={() => setSelectedCert(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}
              >
                 <span className="material-symbols-rounded">close</span>
              </button>
              
              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>Certificate Preview</h2>
                <p style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Verified copy for {selectedCert.achievement}</p>
              </div>

              <div style={{ width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                 <CSSCertificate achievement={selectedCert.achievement} eventName={selectedCert.eventName} date={selectedCert.date} size="large" />
              </div>

              <div style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                 <button className="btn-primary" style={{ padding: '12px 32px' }} onClick={() => handleDownload(selectedCert.eventName)}>
                    <span className="material-symbols-rounded">download</span>
                    Download PDF
                 </button>
                 <button className="btn-outline" style={{ padding: '12px 32px' }} onClick={() => setSelectedCert(null)}>
                    Close Preview
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
