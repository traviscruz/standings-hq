import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getDuration(start, end) {
  if (!start || !end) return null;
  const s = new Date(start + 'T00:00');
  const e = new Date(end + 'T00:00');
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff === 1 ? '1 day' : `${diff} days`;
}

function getCountdown(startDate, startTime) {
  if (!startDate) return null;
  const now = new Date();
  const evDate = new Date(`${startDate}T${startTime || '00:00'}`);
  const diff = evDate - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

export default function DashboardPage() {
  const { selectedEvent, participants, judges, rubrics, showToast, updateEvent } = useEventContext();
  const navigate = useNavigate();
  const [showLogModal, setShowLogModal] = React.useState(false);

  const accepted = judges.filter(j => j.rsvp === 'Accepted' || j.status === 'Accepted').length;
  const pending = participants.filter(p => p.status === 'Pending').length;
  const scoredCount = participants.filter(p => p.score != null).length;
  const totalWeight = rubrics.reduce((s, r) => s + r.weight, 0);
  const countdown = getCountdown(selectedEvent.startDate, selectedEvent.startTime);
  const duration = getDuration(selectedEvent.startDate, selectedEvent.endDate);

  const statusColors = { Active: '#16A34A', Upcoming: '#D97706', Completed: '#3730A3', Cancelled: '#DC2626' };
  const statusColor = statusColors[selectedEvent.status] || 'var(--ink-muted)';

  const auditLogs = [
    { label: 'Event status updated to Active', time: '12m ago', icon: 'sync', color: '#6366F1', bg: '#EEF2FF', user: 'Self' },
    { label: 'Bulk participant invite sent', time: '45m ago', icon: 'group_add', color: 'var(--accent)', bg: 'var(--accent-bg)', user: 'Self' },
    { label: 'Judge seat confirmed: Marian Rivera', time: '2h ago', icon: 'how_to_reg', color: '#16A34A', bg: '#F0FDF4', user: 'System' },
    { label: 'Rubric criteria updated', time: 'Yesterday', icon: 'edit_square', color: '#D97706', bg: '#FFFBEB', user: 'Self' },
    { label: 'Event workspace created', time: '3 days ago', icon: 'add_circle', color: 'var(--navy)', bg: 'var(--page-bg)', user: 'Self' },
  ];

  const recentActivity = [
    ...participants.slice(0, 3).map((p, i) => ({ label: `${p.name} registered`, sub: p.team, time: `${i * 2 + 1}m ago`, icon: 'person_add', bg: 'var(--accent-bg)', color: 'var(--accent-deep)' })),
    ...judges.slice(0, 2).map((j, i) => ({ label: `${j.name} invited`, sub: j.role, time: `${(i + 1) * 8}m ago`, icon: 'mail', bg: '#F0FDF4', color: '#166534' })),
  ];

  const goLive = () => {
    const prev = selectedEvent.status;
    updateEvent(selectedEvent.id, { status: 'Active' });
    showToast(`"${selectedEvent.name}" is now live!`, 'success', () => {
      updateEvent(selectedEvent.id, { status: prev });
      showToast('Status reverted.', 'info');
    });
  };

  return (
    <div className="dashboard-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div className="eyebrow-badge">
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusColor, display: 'inline-block', marginRight: '6px', animation: selectedEvent.status === 'Active' ? 'blink 1.2s infinite' : 'none' }} />
              {selectedEvent.status}
            </div>
            {countdown && <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-muted)' }}>Starts in {countdown}</span>}
          </div>
          <h1 className="page-title">{selectedEvent.name}</h1>
          <p className="page-description">{selectedEvent.description || 'Elevate your event with real-time scoring and professional management.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="secondary-btn" onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Sharing link copied!', 'success'); }}>
            <span className="material-symbols-rounded">share</span>
            Share
          </button>
          
          {selectedEvent.status === 'Active' ? (
            <button className="primary-btn" onClick={() => navigate('/organizer/results')}>
              <span className="material-symbols-rounded">leaderboard</span>
              Real-time Results
            </button>
          ) : selectedEvent.status === 'Completed' ? (
            <button className="primary-btn" onClick={() => navigate('/organizer/results')}>
              <span className="material-symbols-rounded">analytics</span>
              Final Standings
            </button>
          ) : (
            <button className="primary-btn" style={{ background: '#16A34A' }} onClick={goLive}>
              <span className="material-symbols-rounded">play_circle</span>
              Go Live
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Participants</span>
            <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '20px' }}>groups</span>
          </div>
          <div className="stat-value">{participants.length}</div>
          <div className="stat-trend" style={{ color: pending > 0 ? '#D97706' : 'var(--sage)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{pending > 0 ? 'pending' : 'check_circle'}</span>
            {pending} pending registration
          </div>
        </div>

        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Judges</span>
            <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '20px' }}>gavel</span>
          </div>
          <div className="stat-value">{judges.length}</div>
          <div className="stat-trend" style={{ color: 'var(--sage)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>how_to_reg</span>
            {accepted} accepted invites
          </div>
        </div>

        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Scoring Progress</span>
            <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '20px' }}>edit_note</span>
          </div>
          <div className="stat-value">{scoredCount}<span style={{ fontSize: '18px', fontWeight: 400, color: 'var(--ink-muted)', opacity: 0.6 }}>/{participants.length}</span></div>
          <div style={{ marginTop: '12px', height: '6px', background: 'var(--page-bg)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: participants.length ? `${(scoredCount/participants.length)*100}%` : '0%', background: 'var(--accent)', borderRadius: '10px', transition: 'width 1s ease-out' }} />
          </div>
        </div>

        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Rubric Health</span>
            <span className="material-symbols-rounded" style={{ color: totalWeight === 100 ? 'var(--sage)' : '#D97706', fontSize: '20px' }}>{totalWeight === 100 ? 'verified' : 'report'}</span>
          </div>
          <div className="stat-value" style={{ color: totalWeight === 100 ? 'var(--sage)' : 'var(--navy)' }}>{totalWeight}%</div>
          <div className="stat-trend" style={{ color: totalWeight === 100 ? 'var(--sage)' : '#D97706' }}>
            {totalWeight === 100 ? 'Critera balanced' : 'Needs adjustment'}
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="dashboard-grid">
        {/* Left: Combined Activity + Details */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Recent Activity */}
          <div className="form-section">
            <div className="form-section-head" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-rounded">notifications_active</span>
                Recent Activity
              </div>
              <button className="link-btn" style={{ fontSize: '12.5px' }} onClick={() => setShowLogModal(true)}>
                View Audit Log
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 24px', borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-soft)' : 'none', alignItems: 'center', transition: 'background 0.2s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: a.bg, display: 'grid', placeItems: 'center', color: a.color, flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{a.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '2px' }}>{a.label}</p>
                    <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{a.sub}</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink-muted)' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details & Info */}
          <div className="widget-card">
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700, marginBottom: '24px', color: 'var(--navy)' }}>Event Roadmap</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>Schedule</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--navy)', fontWeight: 500 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px', color: 'var(--ink-muted)' }}>calendar_today</span>
                    {formatDate(selectedEvent.startDate)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-muted)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>schedule</span>
                    {selectedEvent.startTime} – {selectedEvent.endTime} ({duration})
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>Configuration</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--navy)', fontWeight: 500 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px', color: 'var(--ink-muted)' }}>category</span>
                    {selectedEvent.type} Event
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-muted)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{selectedEvent.visibility === 'Public' ? 'public' : 'lock'}</span>
                    {selectedEvent.visibility} Access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="widget-card" style={{ background: 'var(--navy)', border: 'none', color: '#fff' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Launch Checklist</h3>
            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px' }}>Complete these to ensure a smooth event.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Set up Rubrics', met: totalWeight === 100, path: '/organizer/rubrics' },
                { label: 'Invite Judges', met: judges.length > 0, path: '/organizer/judges' },
                { label: 'Register Participants', met: participants.length > 0, path: '/organizer/participants' },
              ].map((c, i) => (
                <div key={i} onClick={() => navigate(c.path)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.met ? 'var(--accent)' : 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                    {c.met && <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--navy)' }}>check</span>}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, opacity: c.met ? 1 : 0.6 }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: 'person_add', label: 'Invite Participants', path: '/organizer/participants', color: 'var(--accent)' },
              { icon: 'rule', label: 'Configure Rubric', path: '/organizer/rubrics', color: '#16A34A' },
              { icon: 'gavel', label: 'Manage Judges', path: '/organizer/judges', color: '#D97706' },
              { icon: 'settings', label: 'Event Settings', path: '/organizer/events/settings', color: 'var(--ink-mid)' },
            ].map(a => (
              <button key={a.label} className="quick-action-btn" onClick={() => navigate(a.path)} style={{ padding: '16px' }}>
                <div className="qa-icon" style={{ background: 'var(--page-bg)', color: a.color }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{a.icon}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                  <span className="qa-title" style={{ margin: 0 }}>{a.label}</span>
                  <span className="material-symbols-rounded" style={{ fontSize: '16px', opacity: 0.3 }}>chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--page-bg)' }}>
              <div>
                <h2 className="modal-title" style={{ margin: 0, fontSize: '20px' }}>Audit Log</h2>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '2px' }}>Event history and security logs.</p>
              </div>
              <button className="btn-icon" onClick={() => setShowLogModal(false)}><span className="material-symbols-rounded">close</span></button>
            </div>
            <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '10px 0' }}>
              {auditLogs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 32px', borderBottom: i < auditLogs.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: log.bg, display: 'grid', placeItems: 'center', color: log.color, flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{log.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>{log.label}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{log.time}</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>User: {log.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px 32px', background: 'var(--page-bg)', borderTop: '1px solid var(--border-soft)', textAlign: 'right' }}>
              <button className="secondary-btn" onClick={() => setShowLogModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
