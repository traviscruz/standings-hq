import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { colors } from '../../styles/colors';

// Shared styling from Organizer Certificate Builder for uniformity
const BORDER_TEMPLATES = [
  { id: 'navy', name: 'Royal Navy', bg: '#f8fafc', border: '#1e293b', accent: '#334155', isDark: false, borderStyle: 'solid', type: 'modern' },
  { id: 'minimal', name: 'Silver Minimal', bg: '#fff', border: '#e2e8f0', accent: '#94a3b8', isDark: false, borderStyle: 'solid', type: 'simple' },
  { id: 'ivory', name: 'Ivory Diploma', bg: '#fffdf5', border: '#5c4033', accent: '#8b4513', isDark: false, borderStyle: 'inset', type: 'filigree' },
];

const CSSCertificate = ({ cert, recipientName = 'Riley Cruz', size = 'medium' }) => {
  const isLarge = size === 'large';
  
  const { achievement, eventName, date, customText, templateConfig = {} } = cert;
  
  // Extract custom template configs or set fallback defaults
  const templateId = templateConfig.templateId || 'classic';
  const selectedTemplate = BORDER_TEMPLATES.find(t => t.id === templateId) || BORDER_TEMPLATES[0];
  const bgImage = templateConfig.bgImage || null;
  const bgScale = templateConfig.bgScale ?? 100;
  const bgX = templateConfig.bgX ?? 50;
  const bgY = templateConfig.bgY ?? 50;
  const bgStretch = templateConfig.bgStretch ?? false;
  const orientation = templateConfig.orientation || 'landscape';
  const orgName = templateConfig.orgName || '';
  const signatories = templateConfig.signatories || [
    { id: 1, name: 'Juan Dela Cruz', title: 'Event Organizer' },
    { id: 2, name: 'Maria Santos', title: 'Head Judge' },
  ];

  const isChampion = achievement?.toLowerCase().includes('champion') || achievement?.toLowerCase().includes('runner') || achievement?.toLowerCase().includes('winner');
  const isParticipation = achievement?.toLowerCase().includes('participation');
  const isRecognition = achievement?.toLowerCase().includes('recognition');

  const mainTitleText = isChampion ? 'CHAMPION AWARD' : 'CERTIFICATE';
  const subheaderText = isChampion 
    ? `OF CHAMPIONSHIP EXCELLENCE` 
    : isParticipation 
      ? 'OF ACTIVE PARTICIPATION' 
      : isRecognition 
        ? 'OF SPECIAL RECOGNITION' 
        : 'OF ACHIEVEMENT & EXCELLENCE';

  return (
    <div style={{ 
      aspectRatio: orientation === 'landscape' ? 1.414 : 1 / 1.414,
      background: bgImage ? `url(${bgImage})` : selectedTemplate.bg,
      backgroundPosition: `${bgX}% ${bgY}%`,
      backgroundSize: bgImage ? (bgStretch ? '100% 100%' : `${bgScale}%`) : 'cover',
      backgroundRepeat: 'no-repeat',
      padding: isLarge ? '60px' : '30px', 
      border: bgImage ? 'none' : `${isLarge ? '16px' : '8px'} ${selectedTemplate.borderStyle} ${selectedTemplate.border}`, 
      borderRadius: '16px', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      position: 'relative',
      boxShadow: isLarge ? '0 20px 40px rgba(0,0,0,0.3)' : 'none',
      boxSizing: 'border-box',
      backgroundColor: selectedTemplate.bg,
    }}>
      {/* Decorative corners */}
      {!bgImage && [['0px', null, '0px', null], ['0px', null, null, '0px'], [null, '12px', '0px', null], [null, '12px', null, '0px']].map((pos, i) => (
        <div key={i} style={{ 
          position: 'absolute', top: pos[0] !== null ? (isLarge ? '20px' : '10px') : undefined, bottom: pos[1] !== null ? (isLarge ? '20px' : '10px') : undefined, left: pos[2] !== null ? (isLarge ? '20px' : '10px') : undefined, right: pos[3] !== null ? (isLarge ? '20px' : '10px') : undefined, 
          width: isLarge ? '70px' : '35px', height: isLarge ? '70px' : '35px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'absolute', inset: 0, borderTop: pos[0] !== null ? `${isLarge ? '4px' : '2px'} solid ${selectedTemplate.border}` : 'none', borderBottom: pos[1] !== null ? `${isLarge ? '4px' : '2px'} solid ${selectedTemplate.border}` : 'none', borderLeft: pos[2] !== null ? `${isLarge ? '4px' : '2px'} solid ${selectedTemplate.border}` : 'none', borderRight: pos[3] !== null ? `${isLarge ? '4px' : '2px'} solid ${selectedTemplate.border}` : 'none' }} />
          {selectedTemplate.type === 'ornate' && <div style={{ width: isLarge ? '30px' : '15px', height: isLarge ? '30px' : '15px', border: `${isLarge ? '2px' : '1px'} solid ${selectedTemplate.border}`, transform: 'rotate(45deg)', opacity: 0.8 }} />}
          {selectedTemplate.type === 'filigree' && <div style={{ display: 'flex', gap: isLarge ? '4px' : '2px' }}><div style={{ width: isLarge ? '8px' : '4px', height: isLarge ? '8px' : '4px', borderRadius: '50%', background: selectedTemplate.border }} /><div style={{ width: isLarge ? '8px' : '4px', height: isLarge ? '8px' : '4px', borderRadius: '50%', background: selectedTemplate.border }} /><div style={{ width: isLarge ? '8px' : '4px', height: isLarge ? '8px' : '4px', borderRadius: '50%', background: selectedTemplate.border }} /></div>}
          {selectedTemplate.type === 'circuit' && <div style={{ width: isLarge ? '30px' : '15px', height: isLarge ? '30px' : '15px', border: `1px solid ${selectedTemplate.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: isLarge ? '4px' : '2px', height: isLarge ? '4px' : '2px', background: selectedTemplate.border, borderRadius: '50%' }} /></div>}
          {selectedTemplate.type === 'simple' && <div style={{ width: isLarge ? '10px' : '5px', height: isLarge ? '10px' : '5px', border: `${isLarge ? '2px' : '1px'} solid ${selectedTemplate.border}`, borderRadius: '50%' }} />}
          {selectedTemplate.type === 'fancy' && <div style={{ width: isLarge ? '40px' : '20px', height: isLarge ? '40px' : '20px', border: `${isLarge ? '2px' : '1px'} solid ${selectedTemplate.border}`, borderRadius: '50%', display: 'grid', placeItems: 'center' }}><div style={{ width: isLarge ? '20px' : '10px', height: isLarge ? '20px' : '10px', border: `1px solid ${selectedTemplate.border}`, transform: 'rotate(45deg)' }} /></div>}
        </div>
      ))}
      {!bgImage && selectedTemplate.type === 'circuit' && <div style={{ position: 'absolute', inset: isLarge ? '10px' : '5px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1 }} />}
      {!bgImage && selectedTemplate.type === 'simple' && <div style={{ position: 'absolute', inset: isLarge ? '16px' : '8px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.05 }} />}
      {!bgImage && selectedTemplate.type === 'fancy' && <><div style={{ position: 'absolute', inset: isLarge ? '8px' : '4px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1, borderRadius: '4px' }} /><div style={{ position: 'absolute', inset: isLarge ? '24px' : '12px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1, borderRadius: '2px' }} /></>}
      {!bgImage && selectedTemplate.type === 'ornate' && <div style={{ position: 'absolute', inset: isLarge ? '40px' : '20px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.2, borderRadius: '2px' }} />}
      {!bgImage && selectedTemplate.type === 'filigree' && <div style={{ position: 'absolute', inset: '0', padding: isLarge ? '12px' : '6px' }}><div style={{ width: '100%', height: '100%', border: `1px dashed ${selectedTemplate.border}`, opacity: 0.15 }} /></div>}

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: isLarge ? '12px' : '7px', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: (bgImage || !selectedTemplate.isDark) ? colors.navy : selectedTemplate.accent, marginBottom: isLarge ? '20px' : '8px', opacity: 0.9 }}>
          {orgName ? `${orgName} · ` : ''}{isChampion ? 'Championship Recognition' : 'Official Recognition'}
        </div>
        <div style={{ fontSize: isLarge ? '56px' : '22px', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff', marginBottom: '4px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {mainTitleText}
        </div>
        <div style={{ fontSize: isLarge ? '14px' : '7px', fontWeight: 600, color: (bgImage || !selectedTemplate.isDark) ? colors.inkSoft : 'rgba(255,255,255,0.6)', marginBottom: isLarge ? '24px' : '10px', letterSpacing: '0.1em' }}>
          {subheaderText}
        </div>
        <div style={{ fontSize: isLarge ? '15px' : '8px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMid : 'rgba(255,255,255,0.7)', marginBottom: isLarge ? '12px' : '4px' }}>This prestigious award is proudly presented to</div>
        <div style={{ fontSize: isLarge ? '42px' : '18px', fontFamily: "Georgia, serif", fontStyle: 'italic', color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff', marginBottom: isLarge ? '20px' : '8px', borderBottom: `2px solid ${bgImage || !selectedTemplate.isDark ? colors.borderSoft : selectedTemplate.border}`, paddingBottom: isLarge ? '16px' : '6px', minWidth: isLarge ? '320px' : '140px', fontWeight: 700 }}>{recipientName}</div>
        <div style={{ fontSize: isLarge ? '14px' : '8.5px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkSoft : 'rgba(255,255,255,0.8)', maxWidth: isLarge ? '540px' : '240px', lineHeight: 1.8, marginBottom: isLarge ? '40px' : '16px', fontStyle: 'italic' }}>
          {customText || `In recognition of the exemplary excellence and outstanding achievement shown in ${achievement} at the ${eventName}.`}
        </div>
        
        {/* Signatories */}
        <div style={{ display: 'flex', gap: isLarge ? '60px' : '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {signatories.map(s => (
            <div key={s.id} style={{ textAlign: 'center', minWidth: isLarge ? '140px' : '60px', position: 'relative' }}>
              {s.esign && (
                <div style={{ position: 'absolute', top: isLarge ? '-60px' : '-24px', left: '50%', transform: 'translateX(-50%)', width: isLarge ? '100px' : '40px', pointerEvents: 'none' }}>
                   <img src={s.esign} alt="Sign" style={{ width: '100%', filter: 'contrast(1.2) brightness(0.9) grayscale(0.2)', mixBlendMode: 'multiply' }} />
                </div>
              )}
              <div style={{ width: '100%', borderTop: `1px solid ${bgImage || !selectedTemplate.isDark ? colors.borderSoft : selectedTemplate.border}`, marginBottom: isLarge ? '10px' : '4px', opacity: 0.6 }} />
              <div style={{ fontSize: isLarge ? '14px' : '8px', fontWeight: 700, color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff' }}>{s.name}</div>
              <div style={{ fontSize: isLarge ? '11px' : '6px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMuted : 'rgba(255,255,255,0.5)', marginTop: isLarge ? '4px' : '2px' }}>{s.title}</div>
            </div>
          ))}
        </div>
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

  const handleDownload = (cert) => {
    if (!cert) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Could not open print window. Please check popup blocker.', 'error');
      return;
    }

    const recipientName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Riley Cruz';
    const { achievement, eventName, date, customText, templateConfig = {} } = cert;
    
    const templateId = templateConfig.templateId || 'classic';
    const selectedTemplate = BORDER_TEMPLATES.find(t => t.id === templateId) || BORDER_TEMPLATES[0];
    const bgImage = templateConfig.bgImage || null;
    const bgScale = templateConfig.bgScale ?? 100;
    const bgX = templateConfig.bgX ?? 50;
    const bgY = templateConfig.bgY ?? 50;
    const bgStretch = templateConfig.bgStretch ?? false;
    const orientation = templateConfig.orientation || 'landscape';
    const orgName = templateConfig.orgName || '';
    const signatories = templateConfig.signatories || [
      { id: 1, name: 'Juan Dela Cruz', title: 'Event Organizer' },
      { id: 2, name: 'Maria Santos', title: 'Head Judge' },
    ];

    const isChampion = achievement?.toLowerCase().includes('champion') || achievement?.toLowerCase().includes('runner') || achievement?.toLowerCase().includes('winner');
    const isParticipation = achievement?.toLowerCase().includes('participation');
    const isRecognition = achievement?.toLowerCase().includes('recognition');

    const mainTitleText = isChampion ? 'CHAMPION AWARD' : 'CERTIFICATE';
    const subheaderText = isChampion 
      ? `OF CHAMPIONSHIP EXCELLENCE` 
      : isParticipation 
        ? 'OF ACTIVE PARTICIPATION' 
        : isRecognition 
          ? 'OF SPECIAL RECOGNITION' 
          : 'OF ACHIEVEMENT & EXCELLENCE';

    const aspect = orientation === 'landscape' ? '297mm 210mm' : '210mm 297mm';

    const cornersHtml = !bgImage ? `
      <div style="position: absolute; top: 20px; left: 20px; width: 70px; height: 70px; border-top: 4px solid ${selectedTemplate.border}; border-left: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; top: 20px; right: 20px; width: 70px; height: 70px; border-top: 4px solid ${selectedTemplate.border}; border-right: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 70px; height: 70px; border-bottom: 4px solid ${selectedTemplate.border}; border-left: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; bottom: 20px; right: 20px; width: 70px; height: 70px; border-bottom: 4px solid ${selectedTemplate.border}; border-right: 4px solid ${selectedTemplate.border};"></div>
    ` : '';

    const htmlContent = `
      <html>
        <head>
          <title>${recipientName} - ${achievement} Certificate</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Inter:wght@400;600;700;800&display=swap');
            @page {
              size: ${aspect};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #f1f5f9;
              font-family: 'Inter', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .cert-container {
              width: 297mm;
              height: 210mm;
              background: ${bgImage ? `url(${bgImage})` : selectedTemplate.bg};
              background-position: ${bgX}% ${bgY}%;
              background-size: ${bgImage ? (bgStretch ? '100% 100%' : `${bgScale}%`) : 'cover'};
              background-repeat: no-repeat;
              padding: 60px;
              border: ${bgImage ? 'none' : `16px ${selectedTemplate.borderStyle} ${selectedTemplate.border}`};
              box-sizing: border-box;
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              box-shadow: 0 4px 30px rgba(0,0,0,0.1);
            }
            .org-name {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.3em;
              text-transform: uppercase;
              color: ${bgImage || !selectedTemplate.isDark ? '#0f172a' : selectedTemplate.accent};
              margin-bottom: 24px;
              opacity: 0.9;
            }
            .main-title {
              font-size: 54px;
              font-family: 'DM Sans', sans-serif;
              font-weight: 900;
              color: ${bgImage || !selectedTemplate.isDark ? '#0f172a' : '#ffffff'};
              margin: 0 0 6px 0;
              letter-spacing: -0.02em;
              line-height: 1.1;
            }
            .sub-title {
              font-size: 14px;
              font-weight: 600;
              color: ${bgImage || !selectedTemplate.isDark ? '#475569' : 'rgba(255,255,255,0.6)'};
              margin-bottom: 30px;
              letter-spacing: 0.15em;
            }
            .presented {
              font-size: 15px;
              color: ${bgImage || !selectedTemplate.isDark ? '#334155' : 'rgba(255,255,255,0.7)'};
              margin-bottom: 12px;
            }
            .recipient {
              font-size: 42px;
              font-family: Georgia, serif;
              font-style: italic;
              color: ${bgImage || !selectedTemplate.isDark ? '#0f172a' : '#ffffff'};
              margin-bottom: 24px;
              border-bottom: 2px solid ${bgImage || !selectedTemplate.isDark ? '#e2e8f0' : selectedTemplate.border};
              padding-bottom: 16px;
              min-width: 320px;
              font-weight: 700;
            }
            .custom-text {
              font-size: 14px;
              color: ${bgImage || !selectedTemplate.isDark ? '#475569' : 'rgba(255,255,255,0.8)'};
              max-width: 580px;
              line-height: 1.8;
              margin: 0 auto 40px auto;
              font-style: italic;
            }
            .signatories {
              display: flex;
              gap: 60px;
              justify-content: center;
            }
            .signatory {
              text-align: center;
              min-width: 140px;
              position: relative;
            }
            .sign-line {
              width: 100%;
              border-top: 1px solid ${bgImage || !selectedTemplate.isDark ? '#e2e8f0' : selectedTemplate.border};
              margin-bottom: 10px;
              opacity: 0.6;
            }
            .sign-name {
              font-size: 14px;
              font-weight: 700;
              color: ${bgImage || !selectedTemplate.isDark ? '#0f172a' : '#ffffff'};
            }
            .sign-title {
              font-size: 11px;
              color: ${bgImage || !selectedTemplate.isDark ? '#64748b' : 'rgba(255,255,255,0.5)'};
              margin-top: 4px;
            }
            @media print {
              body {
                background: none;
              }
              .cert-container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="cert-container">
            ${cornersHtml}
            <div class="org-name">${orgName ? `${orgName} · ` : ''}${isChampion ? 'Championship Recognition' : 'Official Recognition'}</div>
            <h1 class="main-title">${mainTitleText}</h1>
            <div class="sub-title">${subheaderText}</div>
            <div class="presented">This prestigious award is proudly presented to</div>
            <div class="recipient">${recipientName}</div>
            <div class="custom-text">${customText || `In recognition of the exemplary excellence and outstanding achievement shown in ${achievement} at the ${eventName}.`}</div>
            
            <div class="signatories">
              ${signatories.map(s => `
                <div class="signatory">
                  ${s.esign ? `
                    <div style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 100px; pointerEvents: none;">
                      <img src="${s.esign}" alt="Sign" style="width: 100%; filter: contrast(1.2) brightness(0.9) grayscale(0.2); mixBlendMode: multiply;" />
                    </div>
                  ` : ''}
                  <div class="sign-line"></div>
                  <div class="sign-name">${s.name}</div>
                  <div class="sign-title">${s.title}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast(`Downloading ${eventName} certificate as high-res PDF...`, 'success');
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
                              onClick={() => handleDownload(cert)}
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
                   <CSSCertificate cert={selectedCert} recipientName={localStorage.getItem('full_name') || localStorage.getItem('username') || 'Riley Cruz'} size={isMobile ? 'medium' : 'large'} />
                </div>
              </div>

              <div style={styles.modalFooter}>
                 <button 
                    style={{ ...styles.btnPrimary, padding: '12px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} 
                    onClick={() => handleDownload(selectedCert)}
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

