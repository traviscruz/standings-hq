import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeHover, setActiveHover] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fname: localStorage.getItem('fname') || '',
    lname: localStorage.getItem('lname') || '',
    username: localStorage.getItem('username') || '',
    email: localStorage.getItem('email') || '',
  });
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('role') || 'Participant');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const handleSave = async () => {
    setIsSaving(true);
    const userId = localStorage.getItem('user_id');
    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          first_name: formData.fname,
          last_name: formData.lname,
          username: formData.username,
          email: formData.email
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');

      localStorage.setItem('fname', formData.fname);
      localStorage.setItem('lname', formData.lname);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('email', formData.email);
      localStorage.setItem('full_name', `${formData.fname} ${formData.lname}`);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const switchRole = (role) => {
    setCurrentRole(role);
    localStorage.setItem('role', role);
    const target = role === 'Organizer' ? '/organizer/dashboard' : '/participant/dashboard';
    navigate(target);
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      animation: 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
    },
    pageHeader: {
      marginBottom: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '24px',
    },
    eyebrow: {
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
    },
    pageTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '28px' : '36px',
      fontWeight: '900',
      color: colors.navy,
      letterSpacing: '-0.04em',
      lineHeight: '1.1',
      margin: 0,
    },
    pageSub: {
      color: colors.inkSoft,
      fontSize: '16px',
      marginTop: '12px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
      gap: '32px',
    },
    // --- DASHBOARD STYLE CARDS ---
    card: (span, color = colors.accent) => ({
      gridColumn: isMobile ? 'span 1' : `span ${span}`,
      background: '#fff',
      border: `1.5px solid ${colors.borderSoft}`,
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }),
    iconWrapper: (bg, color) => ({
      width: '44px',
      height: '44px',
      borderRadius: '14px',
      background: bg,
      color: color,
      display: 'grid',
      placeItems: 'center',
      marginBottom: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    }),
    cardTitle: {
      fontSize: '18px',
      fontWeight: '800',
      color: colors.navy,
      fontFamily: "'DM Sans', sans-serif",
    },
    // --- FORM ELEMENTS ---
    label: {
      fontSize: '11px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.inkMuted,
      marginBottom: '10px',
      display: 'block',
    },
    input: (focused) => ({
      width: '100%',
      height: '48px',
      padding: '0 16px',
      borderRadius: '14px',
      border: `1.5px solid ${focused ? colors.accent : colors.borderSoft}`,
      fontSize: '14.5px',
      color: colors.navy,
      background: focused ? '#fff' : colors.pageBg,
      outline: 'none',
      transition: 'all 0.25s',
      fontWeight: '600',
    }),
    btn: (hovered, primary = false) => ({
      height: '48px',
      padding: '0 28px',
      borderRadius: '14px',
      background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
      fontSize: '14.5px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.25s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transform: hovered ? 'translateY(-2px)' : 'none',
    }),
    roleOption: (active, hovered) => ({
      padding: '20px',
      borderRadius: '18px',
      border: `1.5px solid ${active ? colors.accent : (hovered ? colors.border : colors.borderSoft)}`,
      background: active ? colors.accentBg : '#fff',
      cursor: 'pointer',
      transition: 'all 0.25s',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    })
  };

  return (
    <div style={styles.container}>
      <header style={styles.pageHeader}>
        <div>
          <div style={styles.eyebrow}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>account_circle</span>
            Account & Workspace
          </div>
          <h1 style={styles.pageTitle}>Profile Settings</h1>
          <p style={styles.pageSub}>Manage your identity, role, and workspace security.</p>
        </div>
        <button 
          style={styles.btn(activeHover === 'save', true)}
          onMouseEnter={() => setActiveHover('save')}
          onMouseLeave={() => setActiveHover(null)}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <><span className="material-symbols-rounded">save</span> Save Changes</>
          )}
        </button>
      </header>

      <div style={styles.grid}>
        {/* LEFT COLUMN: PERSONAL INFO */}
        <div style={styles.card(7)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', marginBottom: '8px' }}>
            {/* PROFILE PHOTO UPLOAD */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden',
                background: colors.pageBg, border: `3px solid #fff`, boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                display: 'grid', placeItems: 'center'
              }}>
                {localStorage.getItem(`pfp_${formData.username}`) ? (
                  <img src={localStorage.getItem(`pfp_${formData.username}`)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '32px', fontWeight: '800', color: colors.border }}>{formData.fname[0]}{formData.lname[0]}</span>
                )}
              </div>
              <label style={{ 
                position: 'absolute', bottom: '0', right: '0', 
                width: '32px', height: '32px', borderRadius: '50%', background: colors.navy,
                color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
                border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      localStorage.setItem(`pfp_${formData.username}`, reader.result);
                      setFormData({...formData});
                      setShowSuccess(true);
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>photo_camera</span>
              </label>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={styles.iconWrapper(colors.accentBg, colors.accent)}>
                  <span className="material-symbols-rounded">badge</span>
                </div>
                <h2 style={styles.cardTitle}>Identity & Contact</h2>
              </div>
              <p style={{ fontSize: '13px', color: colors.inkMuted, lineHeight: '1.5' }}>
                Update your personal photo and public profile details. This photo will be visible to other participants and organizers.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={styles.label}>First Name</label>
              <input 
                style={styles.input(activeHover === 'fname')}
                onFocus={() => setActiveHover('fname')}
                onBlur={() => setActiveHover(null)}
                value={formData.fname}
                onChange={(e) => setFormData({...formData, fname: e.target.value})}
              />
            </div>
            <div>
              <label style={styles.label}>Last Name</label>
              <input 
                style={styles.input(activeHover === 'lname')}
                onFocus={() => setActiveHover('lname')}
                onBlur={() => setActiveHover(null)}
                value={formData.lname}
                onChange={(e) => setFormData({...formData, lname: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Username Handle</label>
            <input 
              style={styles.input(activeHover === 'username')}
              onFocus={() => setActiveHover('username')}
              onBlur={() => setActiveHover(null)}
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div>
            <label style={styles.label}>Email Address</label>
            <input 
              style={{ ...styles.input(false), background: colors.pageBg, color: colors.inkMuted, cursor: 'not-allowed' }}
              value={formData.email}
              readOnly
            />
          </div>
        </div>

        {/* RIGHT COLUMN: ROLE & SIGNATURE */}
        <div style={{ ...styles.card(5), gap: '32px' }}>
          {/* ROLE SWITCHER */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={styles.iconWrapper(colors.warningBg, colors.warning)}>
                <span className="material-symbols-rounded">switch_account</span>
              </div>
              <h2 style={styles.cardTitle}>Account Role</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'Participant', icon: 'person', desc: 'Join and view standings' },
                { id: 'Organizer', icon: 'stadium', desc: 'Manage events & judging' }
              ].map(r => (
                <div 
                  key={r.id}
                  style={styles.roleOption(currentRole === r.id, activeHover === `r-${r.id}`)}
                  onMouseEnter={() => setActiveHover(`r-${r.id}`)}
                  onMouseLeave={() => setActiveHover(null)}
                  onClick={() => switchRole(r.id)}
                >
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', 
                    background: currentRole === r.id ? colors.accent : colors.pageBg,
                    color: currentRole === r.id ? '#fff' : colors.navy,
                    display: 'grid', placeItems: 'center'
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{r.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: colors.navy, fontSize: '14px' }}>{r.id}</div>
                    <div style={{ fontSize: '12px', color: colors.inkMuted }}>{r.desc}</div>
                  </div>
                  {currentRole === r.id && <span className="material-symbols-rounded" style={{ marginLeft: 'auto', color: colors.accent }}>check_circle</span>}
                </div>
              ))}
            </div>
          </div>

          {/* SIGNATURE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={styles.iconWrapper('#EEF2FF', '#6366F1')}>
                <span className="material-symbols-rounded">draw</span>
              </div>
              <h2 style={styles.cardTitle}>E-Signature</h2>
            </div>
            
            <div style={{ 
              height: '120px', border: `2px dashed ${colors.border}`, borderRadius: '18px', 
              background: colors.pageBg, display: 'grid', placeItems: 'center', position: 'relative'
            }}>
              {localStorage.getItem(`esign_${formData.username}`) ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={localStorage.getItem(`esign_${formData.username}`)} alt="Sig" style={{ maxHeight: '70px' }} />
                  <button 
                    onClick={() => { localStorage.removeItem(`esign_${formData.username}`); setFormData({...formData}); }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '50%', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: colors.error }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', textAlign: 'center' }}>
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
                  <span className="material-symbols-rounded" style={{ fontSize: '32px', color: colors.border, marginBottom: '4px' }}>upload_file</span>
                  <p style={{ fontSize: '12px', color: colors.inkMuted, fontWeight: '700' }}>Upload PNG</p>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: colors.navy, color: '#fff', padding: '12px 24px', borderRadius: '16px',
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)',
          animation: 'pillDrop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)', zIndex: 1000,
        }}>
          <span className="material-symbols-rounded" style={{ color: colors.success }}>check_circle</span>
          Profile synced successfully!
        </div>
      )}
    </div>
  );
}
