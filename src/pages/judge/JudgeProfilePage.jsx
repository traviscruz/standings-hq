import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { useJudgeContext } from './JudgeLayout';

export default function JudgeProfilePage() {
  const { showToast } = useJudgeContext();
  const userName = localStorage.getItem('username') || 'Official Judge';
  const [signature, setSignature] = useState(null);
  const [activeBtnHover, setActiveBtnHover] = useState(null);

  useEffect(() => {
    // Load existing signature from localStorage
    const savedSig = localStorage.getItem(`esign_${userName}`);
    if (savedSig) setSignature(savedSig);
  }, [userName]);

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast('File too large. Please use an image under 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setSignature(base64);
        localStorage.setItem(`esign_${userName}`, base64);
        showToast('E-Signature updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    setSignature(null);
    localStorage.removeItem(`esign_${userName}`);
    showToast('E-Signature removed.', 'info');
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      animation: 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.02em',
      marginBottom: '8px',
    },
    description: {
      color: colors.inkMid,
      fontSize: '15px',
      lineHeight: '1.6',
    },
    card: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: colors.navy,
      borderBottom: `1px solid ${colors.borderSoft}`,
      paddingBottom: '12px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: colors.inkMuted,
      marginBottom: '8px',
      display: 'block',
    },
    uploadArea: {
      border: `2px dashed ${colors.border}`,
      borderRadius: '20px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: colors.pageBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    },
    signaturePreview: {
      maxWidth: '300px',
      maxHeight: '150px',
      objectFit: 'contain',
      marginTop: '16px',
      filter: 'contrast(1.2) brightness(0.9)',
    },
    btn: (hovered, primary = false, danger = false) => ({
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.22s',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: danger ? (hovered ? 'rgba(239, 68, 68, 0.1)' : 'transparent') : (primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : 'transparent')),
      color: danger ? colors.coral : (primary ? '#fff' : colors.inkSoft),
      border: primary ? 'none' : `1px solid ${danger ? 'transparent' : (hovered ? colors.navy : colors.border)}`,
    }),
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Account Settings</h1>
        <p style={styles.description}>Manage your personal information and digital credentials for paperless scoring and recognition.</p>
      </div>

      <div style={styles.card}>
        <div>
          <h2 style={styles.sectionTitle}>
             <span className="material-symbols-rounded" style={{ color: colors.accent }}>draw</span>
             Digital E-Signature
          </h2>
          <p style={{ fontSize: '14px', color: colors.inkMid, marginBottom: '20px' }}>
            Upload your signature to automatically sign e-certificates and scoring rubrics. For best results, use a transparent PNG or a high-contrast image on a white background.
          </p>

          {!signature ? (
            <label style={{ ...styles.uploadArea, borderColor: activeBtnHover === 'upload' ? colors.accent : colors.border }}
              onMouseEnter={() => setActiveBtnHover('upload')}
              onMouseLeave={() => setActiveBtnHover(null)}
            >
              <input type="file" hidden accept="image/*" onChange={handleSignatureUpload} />
              <div style={{ background: '#fff', width: '48px', height: '48px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: colors.navy, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>upload_file</span>
              </div>
              <span style={{ fontWeight: '700', fontSize: '15px', color: colors.navy }}>Click to upload signature</span>
              <span style={{ fontSize: '13px', color: colors.inkMuted }}>PNG, JPG or SVG (Max. 1MB)</span>
            </label>
          ) : (
            <div style={{ background: colors.pageBg, borderRadius: '20px', padding: '24px', textAlign: 'center', border: `1px solid ${colors.borderSoft}` }}>
              <div style={styles.label}>CURRENT SIGNATURE</div>
              <img src={signature} alt="Judge E-Signature" style={styles.signaturePreview} />
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <label style={{ ...styles.btn(activeBtnHover === 'change', true), cursor: 'pointer' }} onMouseEnter={() => setActiveBtnHover('change')} onMouseLeave={() => setActiveBtnHover(null)}>
                   <input type="file" hidden accept="image/*" onChange={handleSignatureUpload} />
                   Change Signature
                </label>
                <button style={styles.btn(activeBtnHover === 'remove', false, true)} onClick={removeSignature} onMouseEnter={() => setActiveBtnHover('remove')} onMouseLeave={() => setActiveBtnHover(null)}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '24px' }}>
          <h2 style={styles.sectionTitle}>
             <span className="material-symbols-rounded" style={{ color: colors.accent }}>person</span>
             Personal Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div>
                <label style={styles.label}>Full Display Name</label>
                <input type="text" style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '12px', background: '#F8FAFC', color: colors.inkMuted }} value={userName} disabled />
                <p style={{ fontSize: '11px', color: colors.inkMuted, marginTop: '8px' }}>Name as it appears on official documents.</p>
             </div>
             <div>
                <label style={styles.label}>Role</label>
                <input type="text" style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '12px', background: '#F8FAFC', color: colors.inkMuted }} value="Panel Judge" disabled />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
