import React, { useState } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

const AI_SUMMARIES = {
  short: (ev, name) => `The ${ev.name} concluded with an electrifying display of talent, dedication, and sportsmanship. ${name ? `${name} emerged as the undisputed champion,` : 'The champion emerged'} delivering a performance that will be remembered for years to come.`,
  long: (ev, p1, p2, p3) => `The ${ev.name} was held on ${ev.startDate} and brought together competitors from across the region in an unforgettable showcase of excellence. After intense rounds of scoring and evaluation by expert judges, the final standings were determined. ${p1 ? `🥇 ${p1} claimed the top prize` : ''}${p2 ? `, followed closely by 🥈 ${p2}` : ''}${p3 ? ` and 🥉 ${p3}` : ''}. Organizers, judges, and participants alike celebrated a competition marked by integrity, passion, and outstanding sportsmanship. Certificates and recognition have been prepared for all deserving participants.`,
};

export default function PublishPage() {
  const { selectedEvent, participants, showToast, eventsLoading } = useEventContext();
  const ranked = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const [p1, p2, p3] = [ranked[0]?.name, ranked[1]?.name, ranked[2]?.name];

  const [summary, setSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [visibility, setVisibility] = useState({ scores: true, judgeScores: false, comments: false, archived: true });
  const [published, setPublished] = useState(false);
  const [activeBtnHover, setActiveBtnHover] = useState(null);

  if (eventsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: '12px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Loading publish settings…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>event_busy</span>
        <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No event selected.</p>
      </div>
    );
  }

  const scoredCount = participants.filter(p => p.score != null).length;

  const handleAISummary = (type) => {
    setAiLoading(true);
    setTimeout(() => {
      if (type === 'short') setSummary(AI_SUMMARIES.short(selectedEvent, p1));
      else setSummary(AI_SUMMARIES.long(selectedEvent, p1, p2, p3));
      setAiLoading(false);
      showToast('AI summary generated!', 'success');
    }, 1000);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newImgs = files.map(f => ({ id: Date.now() + Math.random(), name: f.name, url: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImgs]);
    showToast(`${files.length} image(s) added to the hub.`, 'info');
    e.target.value = '';
  };

  const styles = {
    pageHeader: {
      marginBottom: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '24px',
      flexWrap: 'wrap',
    },
    pageTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '32px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.03em',
      lineHeight: '1.1',
      margin: 0,
      marginBottom: '8px',
    },
    pageDescription: {
      color: colors.inkMid,
      fontSize: '15px',
      maxWidth: '600px',
      lineHeight: '1.55',
      margin: 0,
    },
    btn: (hovered, primary = false, overrideBg) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '9px 18px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', sans-serif",
      whiteSpace: 'nowrap',
      height: '42px',
      background: overrideBg || (primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff')),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1px solid ${hovered ? colors.navy : colors.border}`,
      boxShadow: hovered ? '0 4px 12px rgba(15, 31, 61, 0.15)' : '0 1px 3px rgba(26,24,20,0.06)',
      transform: hovered ? 'translateY(-1px)' : 'none',
    }),
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: '24px',
      marginBottom: '28px',
    },
    widgetCard: (span) => ({
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '18px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      gridColumn: `span ${span}`,
    }),
    statLabel: {
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.inkMuted,
      marginBottom: '8px',
      display: 'block',
    },
    formSection: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    formSectionHead: {
      padding: '16px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontWeight: 700,
      fontSize: '14px',
      color: colors.navy,
      background: '#FAFBFC',
    },
    formSectionBody: {
      padding: '24px',
    },
    label: {
      fontSize: '11.5px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: colors.inkMuted,
      marginBottom: '8px',
      display: 'block',
    },
    input: {
      width: '100%',
      height: '42px',
      padding: '0 14px',
      border: `1.5px solid ${colors.border}`,
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      color: colors.navy,
      background: '#fff',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    },
  };

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur = (e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; };

  return (
    <>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Publish Hub</h1>
          <p style={styles.pageDescription}>
            Finalize and publish results for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong> to the public leaderboard.
          </p>
        </div>
        {published ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700, fontSize: '14px' }}>
              <span className="material-symbols-rounded">check_circle</span> Published Live
            </span>
            <button
              style={styles.btn(activeBtnHover === 'unpub')}
              onMouseEnter={() => setActiveBtnHover('unpub')}
              onMouseLeave={() => setActiveBtnHover(null)}
              onClick={() => { setPublished(false); showToast('Results unpublished.', 'info'); }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>undo</span> Unpublish
            </button>
          </div>
        ) : (
          <button
            style={styles.btn(activeBtnHover === 'pub', true, activeBtnHover === 'pub' ? '#14532D' : '#16A34A')}
            onMouseEnter={() => setActiveBtnHover('pub')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => { setPublished(true); showToast(`"${selectedEvent.name}" results published live!`, 'success'); }}
            disabled={participants.length === 0}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>rocket_launch</span>
            Publish Results Live
          </button>
        )}
      </div>

      {/* ── Status Cards ── */}
      <div style={styles.dashboardGrid}>
        {[
          { label: 'Scores Submitted', value: `${scoredCount} / ${participants.length}`, icon: 'rule', color: scoredCount === participants.length && participants.length > 0 ? '#16A34A' : '#D97706', ok: scoredCount === participants.length && participants.length > 0 },
          { label: 'Publication Status', value: published ? 'Published' : 'Draft', icon: 'public', color: published ? '#16A34A' : colors.inkMuted, ok: published },
          { label: 'Images Attached', value: images.length, icon: 'photo_library', color: colors.navy, ok: images.length > 0 },
          { label: 'Summary Ready', value: summary ? 'Yes' : 'Not yet', icon: 'short_text', color: summary ? '#16A34A' : colors.inkMuted, ok: !!summary },
        ].map(k => (
          <div key={k.label} style={styles.widgetCard(3)}>
            <span style={styles.statLabel}>{k.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '22px', color: k.color }}>{k.ok ? 'check_circle' : k.icon}</span>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Winners Podium */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">emoji_events</span> Winners
            </div>
            <div style={styles.formSectionBody}>
              {participants.length === 0 ? (
                <p style={{ color: colors.inkMuted, textAlign: 'center', padding: '20px' }}>No participants added yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[0, 1, 2].map(i => {
                    const p = ranked[i];
                    const medals = ['🥇', '🥈', '🥉'];
                    const pos = ['1st Place', '2nd Place', '3rd Place'];
                    const bgs = ['rgba(250,204,21,0.12)', 'rgba(148,163,184,0.12)', 'rgba(180,83,9,0.1)'];
                    return (
                      <div key={i} style={{ padding: '20px 16px', background: bgs[i], borderRadius: '16px', textAlign: 'center', border: `1px solid ${colors.borderSoft}` }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>{medals[i]}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '15px', color: colors.navy, marginBottom: '4px' }}>{p?.name || '—'}</div>
                        <div style={{ fontSize: '12px', color: colors.inkMuted, marginBottom: '8px' }}>{p?.team || ''}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase' }}>{pos[i]}</div>
                        {p?.score != null && <div style={{ fontSize: '28px', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: colors.navy }}>{p.score}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">article</span> Event Summary
            </div>
            <div style={styles.formSectionBody}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <button
                  style={styles.btn(activeBtnHover === 'ai-short')}
                  onClick={() => handleAISummary('short')}
                  disabled={aiLoading}
                  onMouseEnter={() => setActiveBtnHover('ai-short')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>smart_toy</span> AI Short Summary
                </button>
                <button
                  style={styles.btn(activeBtnHover === 'ai-long')}
                  onClick={() => handleAISummary('long')}
                  disabled={aiLoading}
                  onMouseEnter={() => setActiveBtnHover('ai-long')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>auto_stories</span> AI Full Recap
                </button>
                {aiLoading && <span style={{ fontSize: '13px', color: colors.inkMuted, alignSelf: 'center' }}>Writing...</span>}
              </div>
              <textarea
                style={{ ...styles.input, height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }}
                rows={5}
                placeholder={`Write a post-event recap for "${selectedEvent.name}"...`}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
          </div>

          {/* Image Gallery */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">photo_library</span> Event Photos
            </div>
            <div style={styles.formSectionBody}>
              <label
                style={{ ...styles.btn(activeBtnHover === 'upload'), display: 'flex', width: '100%', marginBottom: '16px', borderStyle: 'dashed', cursor: 'pointer' }}
                onMouseEnter={() => setActiveBtnHover('upload')}
                onMouseLeave={() => setActiveBtnHover(null)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload</span>
                Upload Photos
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
              {images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {images.map(img => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3', background: colors.pageBg }}>
                      <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', width: '24px', height: '24px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: colors.inkMuted, textAlign: 'center' }}>No photos uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Visibility Settings ── */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">tune</span> Visibility Settings
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'scores', label: 'Show Final Scores', desc: 'Display participant scores publicly.' },
                { key: 'judgeScores', label: 'Show Individual Judge Scores', desc: 'Reveal per-judge scores to viewers.' },
                { key: 'comments', label: 'Allow Comments', desc: 'Public can comment on results.' },
                { key: 'archived', label: 'Archive After 30 Days', desc: 'Auto-hide from public after 30 days.' },
              ].map(opt => (
                <label key={opt.key} style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <div
                    onClick={() => setVisibility(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                    style={{ width: '42px', height: '24px', borderRadius: '100px', background: visibility[opt.key] ? colors.accent : colors.border, flexShrink: 0, position: 'relative', transition: 'background 0.2s', marginTop: '2px', cursor: 'pointer' }}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: visibility[opt.key] ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.navy }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: colors.inkMuted, marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">download</span> Export Raw Data
            </div>
            <div style={styles.formSectionBody}>
              <p style={{ fontSize: '12.5px', color: colors.inkMuted, lineHeight: 1.6, marginBottom: '14px' }}>
                Download a raw CSV dump of all scores and metadata before publishing.
              </p>
              <button
                style={{ ...styles.btn(activeBtnHover === 'csv'), width: '100%' }}
                onMouseEnter={() => setActiveBtnHover('csv')}
                onMouseLeave={() => setActiveBtnHover(null)}
                onClick={() => showToast('Downloading scores_export.csv...', 'info')}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>file_download</span> Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
