import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeHover, setActiveHover] = useState(null);
  const [formData, setFormData] = useState({
    fname: 'Juan',
    lname: 'Dela Cruz',
    username: 'juandc_99',
    email: 'juan.delacruz@example.com',
  });
  const [currentRole, setCurrentRole] = useState(location.pathname.startsWith('/organizer') ? 'Organizer' : 'Participant');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const switchRole = (role) => {
    setCurrentRole(role);
    const target = role === 'Organizer' ? '/organizer/dashboard' : '/participant/dashboard';
    navigate(target);
  };

  const styles = {
    container: {
      maxWidth: '1100px',
      margin: '0 auto',
      animation: 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginBottom: '40px',
      padding: '32px',
      background: '#fff',
      borderRadius: '24px',
      border: `1px solid ${colors.borderSoft}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '24px',
      background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)`,
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      fontSize: '28px',
      fontWeight: '800',
      boxShadow: '0 8px 16px rgba(30, 45, 74, 0.15)',
    },
    headerInfo: {
      flex: 1,
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.02em',
      margin: 0,
    },
    subtitle: {
      fontSize: '15px',
      color: colors.inkMuted,
      marginTop: '4px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    sectionCard: {
      background: '#fff',
      borderRadius: '24px',
      border: `1px solid ${colors.borderSoft}`,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    sectionHead: {
      padding: '20px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: '#FAFBFC',
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: '700',
      color: colors.navy,
    },
    sectionBody: {
      padding: '24px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      fontSize: '11px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: colors.inkMuted,
      marginBottom: '8px',
      display: 'block',
    },
    input: (focused) => ({
      width: '100%',
      height: '46px',
      padding: '0 16px',
      borderRadius: '12px',
      border: `1.5px solid ${focused ? colors.accent : colors.border}`,
      fontSize: '14.5px',
      color: colors.navy,
      background: focused ? '#fff' : colors.pageBg,
      outline: 'none',
      transition: 'all 0.2s',
      fontFamily: "'Inter', sans-serif",
    }),
    primaryBtn: (hovered, variant = 'navy') => ({
      width: '100%',
      height: '48px',
      borderRadius: '14px',
      background: variant === 'navy' ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.accentDeep : colors.accent),
      color: '#fff',
      border: 'none',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: hovered ? '0 8px 16px rgba(15, 23, 42, 0.15)' : 'none',
      transform: hovered ? 'translateY(-1px)' : 'none',
    }),
    roleGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
    },
    roleChoice: (active, hovered) => ({
      padding: '20px',
      borderRadius: '18px',
      border: `1.5px solid ${active ? colors.accent : (hovered ? colors.border : colors.borderSoft)}`,
      background: active ? colors.accentBg : (hovered ? colors.pageBg : '#fff'),
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      position: 'relative',
    }),
    roleIcon: (active) => ({
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: active ? colors.accent : colors.pageBg,
      color: active ? '#fff' : colors.inkMuted,
      display: 'grid',
      placeItems: 'center',
    }),
    badge: {
      fontSize: '10px',
      fontWeight: '800',
      padding: '4px 10px',
      borderRadius: '100px',
      background: colors.successBg,
      color: colors.success,
      border: `1px solid ${colors.success}33`,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }
  };

  return (
    <div style={styles.container}>
      {/* ── Profile Header ── */}
      <div style={styles.header}>
        <div style={styles.avatar}>JD</div>
        <div style={styles.headerInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={styles.title}>{formData.fname} {formData.lname}</h1>
            <span style={styles.badge}>Active {currentRole}</span>
          </div>
          <p style={styles.subtitle}>@{formData.username} · {formData.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{ ...styles.primaryBtn(activeHover === 'save', 'accent'), width: 'auto', padding: '0 24px' }}
            onMouseEnter={() => setActiveHover('save')}
            onMouseLeave={() => setActiveHover(null)}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
            {!isSaving && <span className="material-symbols-rounded">check_circle</span>}
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* ── Personal Information ── */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHead}>
            <span className="material-symbols-rounded" style={{ color: colors.accent }}>badge</span>
            <span style={styles.sectionTitle}>Personal Information</span>
          </div>
          <div style={styles.sectionBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input 
                  style={styles.input(activeHover === 'fname')} 
                  value={formData.fname}
                  onFocus={() => setActiveHover('fname')}
                  onBlur={() => setActiveHover(null)}
                  onChange={(e) => setFormData({...formData, fname: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input 
                  style={styles.input(activeHover === 'lname')} 
                  value={formData.lname}
                  onFocus={() => setActiveHover('lname')}
                  onBlur={() => setActiveHover(null)}
                  onChange={(e) => setFormData({...formData, lname: e.target.value})}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input 
                style={styles.input(activeHover === 'username')} 
                value={formData.username}
                onFocus={() => setActiveHover('username')}
                onBlur={() => setActiveHover(null)}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                style={styles.input(activeHover === 'email')} 
                value={formData.email}
                onFocus={() => setActiveHover('email')}
                onBlur={() => setActiveHover(null)}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Role & Security ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ── Role Switcher ── */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHead}>
              <span className="material-symbols-rounded" style={{ color: colors.warning }}>switch_account</span>
              <span style={styles.sectionTitle}>Account Role</span>
            </div>
            <div style={styles.sectionBody}>
              <p style={{ fontSize: '14px', color: colors.inkMuted, marginBottom: '20px', lineHeight: '1.5' }}>
                Toggle your account mode to access role-specific dashboards and features.
              </p>
              <div style={styles.roleGrid}>
                {[
                  { id: 'Participant', icon: 'person', desc: 'Join events and view standings.' },
                  { id: 'Organizer', icon: 'event_note', desc: 'Create and manage events.' }
                ].map(r => (
                  <div 
                    key={r.id}
                    style={styles.roleChoice(currentRole === r.id, activeHover === `role-${r.id}`)}
                    onMouseEnter={() => setActiveHover(`role-${r.id}`)}
                    onMouseLeave={() => setActiveHover(null)}
                    onClick={() => switchRole(r.id)}
                  >
                    <div style={styles.roleIcon(currentRole === r.id)}>
                      <span className="material-symbols-rounded">{r.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: colors.navy, fontSize: '15px' }}>{r.id}</div>
                      <div style={{ fontSize: '12px', color: colors.inkMuted, marginTop: '2px' }}>{r.desc}</div>
                    </div>
                    {currentRole === r.id && (
                      <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>check_circle</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── E-Signature (New) ── */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHead}>
              <span className="material-symbols-rounded" style={{ color: colors.accent }}>draw</span>
              <span style={styles.sectionTitle}>Digital E-Signature</span>
            </div>
            <div style={styles.sectionBody}>
              <p style={{ fontSize: '13px', color: colors.inkMuted, marginBottom: '16px', lineHeight: '1.5' }}>
                Upload your signature to automatically sign official documents and e-certificates.
              </p>
              
              {!localStorage.getItem(`esign_${formData.username}`) ? (
                <label style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '24px', border: `2px dashed ${activeHover === 'esign-up' ? colors.accent : colors.border}`,
                  borderRadius: '16px', cursor: 'pointer', background: colors.pageBg, transition: 'all 0.2s'
                }}
                onMouseEnter={() => setActiveHover('esign-up')}
                onMouseLeave={() => setActiveHover(null)}
                >
                  <input type="file" hidden accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        localStorage.setItem(`esign_${formData.username}`, reader.result);
                        setFormData({...formData}); // trigger re-render
                        setShowSuccess(true);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <span className="material-symbols-rounded" style={{ fontSize: '32px', color: colors.inkMuted }}>upload_file</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: colors.navy }}>UPLOAD SIGNATURE</span>
                </label>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px', 
                    padding: '12px', marginBottom: '16px', display: 'grid', placeItems: 'center' 
                  }}>
                    <img src={localStorage.getItem(`esign_${formData.username}`)} alt="Signature" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ ...styles.primaryBtn(activeHover === 'sig-ch', 'navy'), height: '36px', fontSize: '12px', cursor: 'pointer' }}
                           onMouseEnter={() => setActiveHover('sig-ch')} onMouseLeave={() => setActiveHover(null)}>
                      <input type="file" hidden accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            localStorage.setItem(`esign_${formData.username}`, reader.result);
                            setFormData({...formData});
                            setShowSuccess(true);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                      Change
                    </label>
                    <button style={{ ...styles.primaryBtn(activeHover === 'sig-rm'), height: '36px', fontSize: '12px', background: colors.pageBg, color: colors.coral, border: `1px solid ${colors.border}` }}
                           onMouseEnter={() => setActiveHover('sig-rm')} onMouseLeave={() => setActiveHover(null)}
                           onClick={() => { localStorage.removeItem(`esign_${formData.username}`); setFormData({...formData}); }}>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Security ── */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHead}>
              <span className="material-symbols-rounded" style={{ color: colors.coral }}>lock</span>
              <span style={styles.sectionTitle}>Security</span>
            </div>
            <div style={styles.sectionBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Update Password</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="password"
                    style={{ ...styles.input(activeHover === 'pw'), flex: 1 }} 
                    placeholder="••••••••"
                    onFocus={() => setActiveHover('pw')}
                    onBlur={() => setActiveHover(null)}
                  />
                  <button 
                    style={{ ...styles.primaryBtn(activeHover === 'pw-btn'), width: 'auto', padding: '0 16px', height: '46px', background: colors.pageBg, color: colors.navy, border: `1.5px solid ${colors.border}` }}
                    onMouseEnter={() => setActiveHover('pw-btn')}
                    onMouseLeave={() => setActiveHover(null)}
                  >
                    Set New
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: colors.success, color: '#fff', padding: '12px 24px', borderRadius: '100px',
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          animation: 'pillDrop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)', zIndex: 1000,
        }}>
          <span className="material-symbols-rounded">check_circle</span>
          Profile updated successfully!
        </div>
      )}
    </div>
  );
}
