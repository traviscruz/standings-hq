import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config';
import { colors } from '../../styles/colors';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState(null);
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const confirm = async () => {
      const plan = searchParams.get('plan') || 'Monthly';
      const amount = parseFloat(searchParams.get('amount')) || 1499;
      const userId = searchParams.get('userId') || localStorage.getItem('user_id');
      // Paymongo appends ?session_id= to success_url automatically
      const sessionId = searchParams.get('session_id') || null;

      if (!userId) {
        setStatus('error');
        setMessage('Could not identify user. Please log in again.');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/billing/confirm-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId, planName: plan, amount }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to confirm subscription');

        // Update localStorage so the rest of the app knows immediately
        localStorage.setItem('is_subscribed', 'true');
        localStorage.setItem('plan_name', plan);

        setSubscription(data.subscription);
        setStatus('success');
      } catch (err) {
        console.error('Confirm subscription error:', err);
        setStatus('error');
        setMessage(err.message);
      }
    };

    confirm();
  }, [searchParams]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const role = localStorage.getItem('role') || 'Organizer';
  const dashboardPath = role === 'Organizer' ? '/organizer/dashboard' : '/participant/dashboard';

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f5f0ff 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '32px',
        padding: '60px 48px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.08)',
        textAlign: 'center',
        animation: 'fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>

        {status === 'loading' && (
          <>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: `4px solid ${colors.accentBg}`,
              borderTopColor: colors.accent,
              animation: 'spin 0.9s linear infinite',
              margin: '0 auto 28px',
            }} />
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: colors.navy, margin: '0 0 12px' }}>
              Confirming Payment…
            </h1>
            <p style={{ color: colors.inkMuted, fontSize: '15px', lineHeight: 1.6 }}>
              We're verifying your transaction with Paymongo. Please don't close this page.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: colors.navy,
                color: '#fff',
                display: 'grid', placeItems: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(30, 45, 74, 0.2)',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>receipt_long</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: colors.navy, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Payment Receipt
              </h1>
              <p style={{ color: colors.inkMuted, fontSize: '14px', margin: 0, fontFamily: 'monospace' }}>
                TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>

            {/* Receipt Body */}
            {subscription && (
              <div style={{
                background: '#fafafa',
                border: `1px dashed #d1d5db`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
                textAlign: 'left',
                position: 'relative',
              }}>
                {/* Decorative cutouts */}
                <div style={{ position: 'absolute', top: '50%', left: '-8px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', borderRight: '1px dashed #d1d5db', transform: 'translateY(-50%)' }} />
                <div style={{ position: 'absolute', top: '50%', right: '-8px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', borderLeft: '1px dashed #d1d5db', transform: 'translateY(-50%)' }} />

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', color: colors.inkMuted, margin: '0 0 4px' }}>Amount Paid</p>
                  <h2 style={{ fontSize: '36px', fontWeight: '900', color: colors.navy, margin: 0 }}>
                    ₱{parseFloat(subscription.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </h2>
                </div>

                <div style={{ borderTop: '1px dashed #d1d5db', margin: '20px 0' }} />

                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { label: 'Plan Subscribed', value: `${subscription.plan_name} Plan` },
                    { label: 'Date Issued', value: formatDate(subscription.start_date) },
                    { label: 'Valid Until', value: formatDate(subscription.end_date) },
                    { label: 'Status', value: 'Paid & Active' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: colors.inkMuted, fontWeight: '500' }}>{label}</span>
                      <span style={{ fontSize: '14px', color: colors.navy, fontWeight: '700', fontFamily: label === 'Status' ? 'inherit' : 'monospace' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #d1d5db', margin: '20px 0' }} />
                
                <div style={{ textAlign: 'center', opacity: 0.5 }}>
                  {/* Fake Barcode */}
                  <div style={{ 
                    height: '40px', 
                    background: 'repeating-linear-gradient(90deg, #1A1814, #1A1814 2px, transparent 2px, transparent 4px, #1A1814 4px, #1A1814 8px, transparent 8px, transparent 10px, #1A1814 10px, #1A1814 12px, transparent 12px, transparent 16px)',
                    margin: '0 auto 8px',
                    width: '80%'
                  }} />
                  <span style={{ fontSize: '10px', letterSpacing: '0.2em', fontFamily: 'monospace' }}>THANK YOU FOR UPGRADING</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate(dashboardPath)}
                style={{
                  height: '52px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDeep})`,
                  color: '#fff', border: 'none',
                  fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: `0 8px 20px ${colors.accentGlow}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 28px ${colors.accentGlow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 20px ${colors.accentGlow}`; }}
              >
                <span className="material-symbols-rounded">dashboard</span>
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/organizer/profile', { state: { activeTab: 'plan' } })}
                style={{
                  height: '48px', borderRadius: '16px',
                  background: 'transparent', color: colors.inkSoft,
                  border: `1.5px solid ${colors.borderSoft}`,
                  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.navy; e.currentTarget.style.color = colors.navy; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.borderSoft; e.currentTarget.style.color = colors.inkSoft; }}
              >
                View Subscription Details
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'grid', placeItems: 'center',
              margin: '0 auto 28px',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.25)',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '44px', color: '#fff', fontVariationSettings: "'FILL' 1" }}>
                error
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: '900', color: colors.navy, margin: '0 0 12px' }}>
              Something Went Wrong
            </h1>
            <p style={{ color: colors.inkMuted, fontSize: '15px', lineHeight: 1.6, margin: '0 0 32px' }}>
              {message || 'We could not confirm your payment. If you were charged, please contact support.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/organizer/profile', { state: { activeTab: 'plan' } })}
                style={{
                  height: '52px', borderRadius: '16px',
                  background: colors.navy, color: '#fff', border: 'none',
                  fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Try Again
              </button>
              <button
                onClick={() => navigate(dashboardPath)}
                style={{
                  height: '48px', borderRadius: '16px',
                  background: 'transparent', color: colors.inkMuted,
                  border: `1.5px solid ${colors.borderSoft}`,
                  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
