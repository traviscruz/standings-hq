import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../config';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'account');
  const [isSubscribed, setIsSubscribed] = useState(localStorage.getItem('is_subscribed') === 'true');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showManageBilling, setShowManageBilling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSubscription = useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/billing/subscription/${userId}`);
      const data = await res.json();
      if (data.subscription && (data.subscription.status === 'active' || data.subscription.status === 'cancelled')) {
        setIsSubscribed(true);
        setSubscriptionData(data.subscription);
        localStorage.setItem('is_subscribed', 'true');
        localStorage.setItem('plan_name', data.subscription.plan_name);
        window.dispatchEvent(new Event('subscriptionChanged'));
      } else {
        setIsSubscribed(false);
        setSubscriptionData(null);
        localStorage.setItem('is_subscribed', 'false');
        window.dispatchEvent(new Event('subscriptionChanged'));
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'plan') {
      fetchSubscription();
    }
  }, [activeTab, fetchSubscription]);

  useEffect(() => {
    const status = new URLSearchParams(location.search).get('status');
    if (status === 'cancelled') {
      alert('Payment was cancelled.');
    }
  }, [location]);

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

  const handlePaymongoCheckout = async (planName, price) => {
    setIsSaving(true);
    const userId = localStorage.getItem('user_id');
    
    try {
      const response = await fetch(`${API_URL}/billing/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planName, price })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create checkout');

      setTimeout(() => {
        window.location.href = data.checkout_url;
      }, 800);
    } catch (err) {
      console.error('Checkout Error:', err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSubscription = async () => {
    const userId = localStorage.getItem('user_id');
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/billing/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchSubscription();
        setShowManageBilling(false);
        setShowCancelModal(false);
      }
    } catch (err) {
      console.error('Failed to cancel subscription', err);
    } finally {
      setIsSaving(false);
    }
  };

  const renewSubscription = async () => {
    const userId = localStorage.getItem('user_id');
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/billing/renew-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchSubscription();
        setShowManageBilling(false);
      }
    } catch (err) {
      console.error('Failed to renew subscription', err);
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
    }),
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '32px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      paddingBottom: '0',
    },
    tab: (active) => ({
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '700',
      color: active ? colors.navy : colors.inkSoft,
      cursor: 'pointer',
      position: 'relative',
      transition: '0.2s',
      background: 'none',
      border: 'none',
    }),
    tabIndicator: {
      position: 'absolute',
      bottom: '-1px',
      left: '0',
      right: '0',
      height: '3px',
      background: colors.accent,
      borderRadius: '3px 3px 0 0',
    },
    planCard: {
      background: colors.navy,
      borderRadius: '24px',
      padding: '40px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    },
    planBadge: {
      position: 'absolute',
      top: '24px',
      right: '24px',
      background: colors.accent,
      color: '#fff',
      padding: '6px 14px',
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 31, 61, 0.4)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', zIndex: 1000,
      padding: '20px', animation: 'fadeIn 0.2s ease-out',
    },
    modalContainer: {
      background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '420px',
      boxShadow: '0 16px 48px rgba(26,24,20,0.12)', padding: '32px', position: 'relative',
      animation: 'modalUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    modalTitle: {
      fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: '800',
      color: colors.navy, letterSpacing: '-0.02em', margin: 0,
    }
  };

  return (
    <>
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

      <div style={styles.tabs}>
        <button 
          style={styles.tab(activeTab === 'account')} 
          onClick={() => setActiveTab('account')}
        >
          Account Settings
          {activeTab === 'account' && <div style={styles.tabIndicator} />}
        </button>
        <button 
          style={styles.tab(activeTab === 'plan')} 
          onClick={() => setActiveTab('plan')}
        >
          Subscription Plan
          {activeTab === 'plan' && <div style={styles.tabIndicator} />}
        </button>
      </div>

      {activeTab === 'account' ? (
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
      ) : (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {isSubscribed ? (
            <>
              <div style={styles.planCard}>
                <div style={styles.planBadge}>Active Plan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Pro Elite</h2>
                  <p style={{ fontSize: '16px', opacity: 0.7, margin: 0 }}>Professional event infrastructure enabled.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '12px', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', marginBottom: '8px' }}>Billing Cycle</p>
                    <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{subscriptionData ? `${subscriptionData.plan_name} Subscription` : 'Monthly Subscription'}</p>
                    {subscriptionData?.status === 'cancelled' && (
                      <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '11px', fontWeight: '800', color: colors.warning, background: 'rgba(245, 158, 11, 0.2)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Cancelled (Non-Renewing)</span>
                    )}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '12px', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', marginBottom: '8px' }}>{subscriptionData?.status === 'cancelled' ? 'Valid Until' : 'Next Invoice'}</p>
                    <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{subscriptionData ? new Date(subscriptionData.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'June 10, 2026'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    style={styles.btn(activeHover === 'manage-sub', true)} 
                    onMouseEnter={() => setActiveHover('manage-sub')} 
                    onMouseLeave={() => setActiveHover(null)}
                    onClick={() => setShowManageBilling(!showManageBilling)}
                  >
                    {showManageBilling ? 'Close Billing Options' : 'Manage Billing'}
                  </button>
                  {subscriptionData?.status === 'active' && (
                    <button 
                      style={styles.btn(activeHover === 'cancel-sub')} 
                      onMouseEnter={() => setActiveHover('cancel-sub')} 
                      onMouseLeave={() => setActiveHover(null)}
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel Subscription
                    </button>
                  )}
                  {subscriptionData?.status === 'cancelled' && (
                    <button 
                      style={{ ...styles.btn(activeHover === 'renew-sub', true), background: colors.success, boxShadow: activeHover === 'renew-sub' ? `0 4px 12px ${colors.success}40` : 'none' }} 
                      onMouseEnter={() => setActiveHover('renew-sub')} 
                      onMouseLeave={() => setActiveHover(null)}
                      onClick={renewSubscription}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Processing...' : 'Renew Subscription'}
                    </button>
                  )}
                </div>

                {showManageBilling && (
                  <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s ease forwards' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', margin: 0 }}>Change Plan</h3>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
                      {subscriptionData?.plan_name !== 'Yearly' && (
                        <div style={{ flex: 1, padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Yearly</h4>
                          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Save 20% compared to monthly.</p>
                          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>₱14,990<span style={{ fontSize: '14px', opacity: 0.5, fontWeight: 'normal' }}>/yr</span></h2>
                          <button 
                            style={{ ...styles.btn(activeHover === 'change-yearly'), width: '100%', marginTop: 'auto', background: activeHover === 'change-yearly' ? '#f8fafc' : '#ffffff', color: colors.navy, border: 'none' }} 
                            onMouseEnter={() => setActiveHover('change-yearly')}
                            onMouseLeave={() => setActiveHover(null)}
                            onClick={() => handlePaymongoCheckout('Yearly', 14990)}
                          >
                            Upgrade to Yearly
                          </button>
                        </div>
                      )}
                      {subscriptionData?.plan_name !== 'Monthly' && (
                        <div style={{ flex: 1, padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Monthly</h4>
                          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Flexible month-to-month billing.</p>
                          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>₱1,499<span style={{ fontSize: '14px', opacity: 0.5, fontWeight: 'normal' }}>/mo</span></h2>
                          <button 
                            style={{ ...styles.btn(activeHover === 'change-monthly'), width: '100%', marginTop: 'auto', background: activeHover === 'change-monthly' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} 
                            onMouseEnter={() => setActiveHover('change-monthly')}
                            onMouseLeave={() => setActiveHover(null)}
                            onClick={() => handlePaymongoCheckout('Monthly', 1499)}
                          >
                            Switch to Monthly
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.navy, marginBottom: '20px' }}>Plan Features</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { i: 'groups', t: 'Unlimited Participants' },
                    { i: 'verified', t: 'Automated Certificates' },
                    { i: 'analytics', t: 'Advanced Analytics' },
                    { i: 'cloud_sync', t: 'Real-time Syncing' },
                    { i: 'shield', t: 'Priority Support' },
                    { i: 'database', t: 'Audit Trail Exports' }
                  ].map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '14px' }}>
                      <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>{f.i}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: colors.navy }}>{f.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              background: colors.pageBg, borderRadius: '24px', padding: '48px 40px', textAlign: 'center',
              border: `2px dashed ${colors.borderSoft}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px'
            }}>
              <div style={{ maxWidth: '500px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#fff', color: colors.accent, display: 'grid', placeItems: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', margin: '0 auto 24px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>subscriptions</span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: colors.navy, marginBottom: '12px' }}>Choose Your Plan</h2>
                <p style={{ fontSize: '16px', color: colors.inkSoft, lineHeight: 1.6 }}>Subscribe to Pro Elite to unlock all professional event management features.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', width: '100%', maxWidth: '700px' }}>
                {/* Monthly Card */}
                <div style={{ background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', textAlign: 'left', transition: 'transform 0.2s', transform: activeHover === 'monthly-card' ? 'translateY(-4px)' : 'none', boxShadow: activeHover === 'monthly-card' ? '0 12px 24px rgba(0,0,0,0.04)' : 'none' }} onMouseEnter={() => setActiveHover('monthly-card')} onMouseLeave={() => setActiveHover(null)}>
                  <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.navy }}>Monthly</h4>
                  <p style={{ margin: '8px 0 24px', fontSize: '14px', color: colors.inkSoft }}>Flexible month-to-month billing.</p>
                  <h2 style={{ margin: '0 0 32px', fontSize: '32px', fontWeight: '900', color: colors.navy }}>₱1,499<span style={{ fontSize: '16px', color: colors.inkMuted, fontWeight: 'normal' }}>/mo</span></h2>
                  <button 
                    style={{ ...styles.btn(activeHover === 'sub-monthly'), marginTop: 'auto', background: activeHover === 'sub-monthly' ? colors.navySoft : '#fff', color: activeHover === 'sub-monthly' ? '#fff' : colors.navy, border: `1.5px solid ${colors.navy}` }}
                    onMouseEnter={() => setActiveHover('sub-monthly')}
                    onMouseLeave={() => setActiveHover('monthly-card')}
                    onClick={() => handlePaymongoCheckout('Monthly', 1499)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Processing...' : 'Subscribe Monthly'}
                  </button>
                </div>

                {/* Yearly Card */}
                <div style={{ background: colors.navy, borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', transform: activeHover === 'yearly-card' ? 'translateY(-4px)' : 'none', boxShadow: activeHover === 'yearly-card' ? '0 12px 24px rgba(15,23,42,0.15)' : 'none' }} onMouseEnter={() => setActiveHover('yearly-card')} onMouseLeave={() => setActiveHover(null)}>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Save 20%</div>
                  <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#fff' }}>Yearly</h4>
                  <p style={{ margin: '8px 0 24px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Best value for professionals.</p>
                  <h2 style={{ margin: '0 0 32px', fontSize: '32px', fontWeight: '900', color: '#fff' }}>₱14,990<span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>/yr</span></h2>
                  <button 
                    style={{ ...styles.btn(activeHover === 'sub-yearly'), marginTop: 'auto', background: activeHover === 'sub-yearly' ? '#f1f5f9' : '#ffffff', color: colors.navy, border: 'none' }}
                    onMouseEnter={() => setActiveHover('sub-yearly')}
                    onMouseLeave={() => setActiveHover('yearly-card')}
                    onClick={() => handlePaymongoCheckout('Yearly', 14990)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Processing...' : 'Subscribe Yearly'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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

      {showCancelModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div style={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div style={{ width: '52px', height: '52px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-rounded" style={{ color: colors.warning, fontSize: '26px' }}>warning</span>
            </div>
            <h2 style={{ ...styles.modalTitle, textAlign: 'center', marginBottom: '10px' }}>Cancel Subscription?</h2>
            <p style={{ fontSize: '14px', color: colors.inkSoft, textAlign: 'center', lineHeight: '1.5', marginBottom: '28px' }}>
              Are you sure you want to cancel? You will still have access to all Pro features until <strong>{new Date(subscriptionData?.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                style={{ ...styles.btn(activeHover === 'cancel-modal-close'), flex: 1 }} 
                onClick={() => setShowCancelModal(false)}
                onMouseEnter={() => setActiveHover('cancel-modal-close')} 
                onMouseLeave={() => setActiveHover(null)}
              >
                Keep Plan
              </button>
              <button
                style={{ ...styles.btn(activeHover === 'cancel-modal-confirm', true), flex: 1, background: colors.coral }}
                onClick={cancelSubscription}
                onMouseEnter={() => setActiveHover('cancel-modal-confirm')}
                onMouseLeave={() => setActiveHover(null)}
                disabled={isSaving}
              >
                {isSaving ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
