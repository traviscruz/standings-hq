import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { colors } from '../../styles/colors';

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
      padding: isLarge ? '48px' : '24px', 
      border: `4px solid ${template.border}`, 
      borderRadius: '16px', 
      width: '100%',
      aspectRatio: isLarge ? '1.414 / 1' : 'auto', 
      minHeight: isLarge ? 'auto' : '200px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      position: 'relative',
      boxShadow: isLarge ? '0 20px 40px rgba(0,0,0,0.3)' : 'none',
      boxSizing: 'border-box'
    }}>
      {/* Decorative corners */}
      {['0 0', '0 auto', 'auto 0', 'auto auto'].map((pos, i) => (
        <div key={i} style={{ 
            position: 'absolute', 
            top: i < 2 ? '12px' : undefined, 
            bottom: i >= 2 ? '12px' : undefined, 
            left: i % 2 === 0 ? '12px' : undefined, 
            right: i % 2 === 1 ? '12px' : undefined, 
            width: isLarge ? '28px' : '12px', 
            height: isLarge ? '28px' : '12px', 
            border: `2px solid ${template.border}`, 
            borderRadius: '2px', 
            opacity: 0.4 
        }} />
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const handleDownload = (name) => {
    showToast(`Downloading ${name} certificate as high-res PDF...`, 'success');
  };

  const pageHeaderStyle = {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexDirection: isMobile ? 'column' : 'row',
  };

  const eyebrowBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: 'rgba(59, 130, 246, 0.08)',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '800',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  };

  const pageTitleStyle = {
    fontSize: isMobile ? '26px' : '32px',
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '8px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const pageDescriptionStyle = {
    color: colors.inkMuted,
    fontSize: '15px',
    maxWidth: '600px',
    lineHeight: '1.55',
  };

  const styles = {
    card: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '20px',
      boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
      overflow: 'hidden',
    },
    btnOutline: {
      background: '#fff',
      color: colors.navy,
      padding: '10px 20px',
      borderRadius: '12px',
      fontWeight: '600',
      border: `1px solid ${colors.border}`,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      textDecoration: 'none',
      fontSize: '14px'
    },
    btnPrimary: {
      background: colors.navy,
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '12px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      textDecoration: 'none',
      fontSize: '14px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 31, 61, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out forwards',
    },
    modalContainer: (maxWidth = '850px') => ({
      background: '#fff',
      borderRadius: '24px',
      width: '100%',
      maxWidth: maxWidth,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'modalUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
    }),
    modalHeader: {
      padding: isMobile ? '24px 24px 16px' : '40px 48px 24px',
      textAlign: 'center',
    },
    modalBody: {
      padding: isMobile ? '0 24px 24px' : '0 48px 40px',
      overflowY: 'auto',
      flex: 1,
    },
    modalFooter: {
      padding: isMobile ? '24px' : '0 48px 48px',
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      borderTop: isMobile ? `1px solid ${colors.borderSoft}` : 'none',
      background: isMobile ? colors.pageBg : 'transparent',
    },
    closeBtn: {
      position: 'absolute',
      top: '24px',
      right: '24px',
      background: colors.pageBg,
      border: 'none',
      cursor: 'pointer',
      color: colors.inkMuted,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      transition: 'all 0.2s',
      zIndex: 10
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      <div className="slide-up-anim">
        <header style={pageHeaderStyle}>
          <div>
            <div style={eyebrowBadgeStyle}>
              <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>workspace_premium</span>
              Achievement Vault
            </div>
            <h1 style={pageTitleStyle}>Certificates & Awards</h1>
            <p style={pageDescriptionStyle}>Manage and download your official performance credentials for all past competitions.</p>
          </div>
          <div style={{ width: isMobile ? '100%' : 'auto' }}>
            <button 
                  style={{ ...styles.btnOutline, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start' }} 
                  onClick={() => showToast('Syncing certificates...', 'success')}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = colors.navy; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = colors.border; }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>sync</span>
              Refresh List
            </button>
          </div>
        </header>

        <div style={styles.card}>
          <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', paddingLeft: '32px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Certificate</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Competition</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Issue Date</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', paddingRight: '32px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} style={{ borderBottom: `1px solid ${colors.borderSoft}`, transition: 'background 0.2s' }}>
                      <td style={{ padding: '24px 16px 24px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: colors.navy, display: 'grid', placeItems: 'center' }}>
                            <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '20px' }}>workspace_premium</span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: colors.navy }}>{cert.achievement}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: colors.inkSoft, fontWeight: 500 }}>{cert.eventName}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: colors.inkMuted }}>{cert.date}</td>
                      <td style={{ padding: '16px', paddingRight: '32px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button 
                              style={{ ...styles.btnOutline, padding: '8px 16px', fontSize: '13px' }} 
                              onClick={() => setSelectedCert(cert)}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = colors.navy; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = colors.border; }}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>visibility</span>
                              View
                            </button>
                            <button 
                              style={{ ...styles.btnPrimary, padding: '8px 16px', fontSize: '13px' }} 
                              onClick={() => handleDownload(cert.eventName)}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 31, 61, 0.15)'; e.currentTarget.style.background = '#1a3a6a'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = colors.navy; }}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
                              Download
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          
          {certificates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 32px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '64px', color: colors.border, marginBottom: '16px', display: 'block' }}>inventory_2</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.navy, marginBottom: '8px', margin: 0 }}>No Certificates Earned</h3>
              <p style={{ fontSize: '14px', color: colors.inkMuted, margin: 0 }}>Complete your first event to receive an official certificate.</p>
            </div>
          )}
        </div>
      </div>

      {/* Viewing Modal */}
      {selectedCert && (
        <div 
          onClick={() => setSelectedCert(null)}
          style={{
            ...styles.modalOverlay,
            background: 'rgba(15, 31, 61, 0.5)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
           <div 
             onClick={(e) => e.stopPropagation()}
             style={styles.modalContainer('850px')}
           >
              <button 
                onClick={() => setSelectedCert(null)}
                style={styles.closeBtn}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.borderSoft; e.currentTarget.style.color = colors.navy; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = colors.pageBg; e.currentTarget.style.color = colors.inkMuted; }}
              >
                 <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
              </button>

              <div style={styles.modalHeader}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: colors.navy, marginBottom: '8px', margin: 0, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>Certificate Preview</h2>
                <p style={{ fontSize: '15px', color: colors.inkMuted, margin: 0 }}>Verified copy of your achievement</p>
              </div>

              <div style={styles.modalBody}>
                <div style={{ width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', borderRadius: '16px' }}>
                   <CSSCertificate achievement={selectedCert.achievement} eventName={selectedCert.eventName} date={selectedCert.date} size={isMobile ? 'medium' : 'large'} />
                </div>
              </div>

              <div style={styles.modalFooter}>
                 <button 
                    style={{ ...styles.btnPrimary, padding: '12px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} 
                    onClick={() => handleDownload(selectedCert.eventName)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 31, 61, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                 >
                    <span className="material-symbols-rounded">download</span>
                    Download PDF
                 </button>
                 <button 
                    style={{ ...styles.btnOutline, padding: '12px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} 
                    onClick={() => setSelectedCert(null)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = colors.navy; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = colors.border; }}
                 >
                    Close Preview
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}

