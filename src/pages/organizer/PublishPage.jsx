import React, { useState } from 'react';
import { useEventContext } from './OrganizerLayout';

const AI_SUMMARIES = {
  short: (ev, name) => `The ${ev.name} concluded with an electrifying display of talent, dedication, and sportsmanship. ${name ? `${name} emerged as the undisputed champion,` : 'The champion emerged'} delivering a performance that will be remembered for years to come.`,
  long: (ev, p1, p2, p3) => `The ${ev.name} was held on ${ev.startDate} and brought together competitors from across the region in an unforgettable showcase of excellence. After ${ev?.participants?.length ?? 'numerous'} intense rounds of scoring and evaluation by expert judges, the final standings were determined. ${p1 ? `🥇 ${p1} claimed the top prize` : ''}${p2 ? `, followed closely by 🥈 ${p2}` : ''}${p3 ? ` and 🥉 ${p3}` : ''}. Organizers, judges, and participants alike celebrated a competition marked by integrity, passion, and outstanding sportsmanship. Certificates and recognition have been prepared for all deserving participants.`,
};

export default function PublishPage() {
  const { selectedEvent, participants, showToast } = useEventContext();

  const ranked = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const [p1, p2, p3] = [ranked[0]?.name, ranked[1]?.name, ranked[2]?.name];

  const [summary, setSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [visibility, setVisibility] = useState({ scores: true, judgeScores: false, comments: false, archived: true });
  const [published, setPublished] = useState(false);

  const scoredCount = participants.filter(p => p.score != null).length;
  const isReady = scoredCount === participants.length && participants.length > 0;

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

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handlePublish = () => {
    setPublished(true);
    showToast(`"${selectedEvent.name}" results published live!`, 'success');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Publish Hub</h1>
          <p className="page-description">Finalize and publish results for <strong style={{ color: 'var(--navy)' }}>{selectedEvent.name}</strong> to the public leaderboard.</p>
        </div>
        {published ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700, fontSize: '14px' }}>
              <span className="material-symbols-rounded">check_circle</span> Published Live
            </span>
            <button className="secondary-btn" onClick={() => { setPublished(false); showToast('Results unpublished.', 'info'); }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>undo</span> Unpublish
            </button>
          </div>
        ) : (
          <button className="primary-btn" style={{ background: '#16A34A' }} onClick={handlePublish} disabled={participants.length === 0}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>rocket_launch</span>
            Publish Results Live
          </button>
        )}
      </div>

      {/* ── Status Cards ── */}
      <div className="dashboard-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Scores Submitted', value: `${scoredCount} / ${participants.length}`, icon: 'rule', color: isReady ? '#16A34A' : '#D97706', ok: isReady },
          { label: 'Publication Status', value: published ? 'Published' : 'Draft', icon: 'public', color: published ? '#16A34A' : 'var(--ink-muted)', ok: published },
          { label: 'Images Attached', value: images.length, icon: 'photo_library', color: 'var(--navy)', ok: images.length > 0 },
          { label: 'Summary Ready', value: summary ? 'Yes' : 'Not yet', icon: 'short_text', color: summary ? '#16A34A' : 'var(--ink-muted)', ok: !!summary },
        ].map(k => (
          <div key={k.label} className="widget-card col-span-3">
            <span className="stat-label">{k.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '22px', color: k.color }}>{k.ok ? 'check_circle' : k.icon}</span>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Winners Podium */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">emoji_events</span> Winners</div>
            <div className="form-section-body">
              {participants.length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '20px' }}>No participants added yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[0, 1, 2].map(i => {
                    const p = ranked[i];
                    const medals = ['🥇', '🥈', '🥉'];
                    const pos = ['1st Place', '2nd Place', '3rd Place'];
                    const colors = ['rgba(250,204,21,0.12)', 'rgba(148,163,184,0.12)', 'rgba(180,83,9,0.1)'];
                    return (
                      <div key={i} style={{ padding: '20px 16px', background: colors[i], borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-soft)' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>{medals[i]}</div>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '15px', color: 'var(--navy)', marginBottom: '4px' }}>{p?.name || '—'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '8px' }}>{p?.team || ''}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>{pos[i]}</div>
                        {p?.score != null && (
                          <div style={{ fontSize: '28px', fontFamily: 'var(--font-head)', fontWeight: 900, color: 'var(--navy)' }}>{p.score}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">article</span> Event Summary</div>
            <div className="form-section-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <button className="secondary-btn" style={{ fontSize: '12.5px', padding: '7px 14px' }} onClick={() => handleAISummary('short')} disabled={aiLoading}>
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>smart_toy</span>
                  AI Short Summary
                </button>
                <button className="secondary-btn" style={{ fontSize: '12.5px', padding: '7px 14px' }} onClick={() => handleAISummary('long')} disabled={aiLoading}>
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>auto_stories</span>
                  AI Full Recap
                </button>
                {aiLoading && <span style={{ fontSize: '13px', color: 'var(--ink-muted)', alignSelf: 'center' }}>Writing...</span>}
              </div>
              <textarea className="custom-input" rows={5} placeholder={`Write a post-event recap for "${selectedEvent.name}"...`} value={summary} onChange={e => setSummary(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }} />
            </div>
          </div>

          {/* Image Gallery */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">photo_library</span> Event Photos</div>
            <div className="form-section-body">
              <label className="secondary-btn" style={{ cursor: 'pointer', justifyContent: 'center', width: '100%', marginBottom: '16px', borderStyle: 'dashed' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload</span>
                Upload Photos
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {images.map(img => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--page-bg)' }}>
                      <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', width: '24px', height: '24px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center' }}>No photos uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Visibility Settings ── */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">tune</span> Visibility Settings</div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'scores', label: 'Show Final Scores', desc: 'Display participant scores publicly.' },
                { key: 'judgeScores', label: 'Show Individual Judge Scores', desc: 'Reveal per-judge scores to viewers.' },
                { key: 'comments', label: 'Allow Comments', desc: 'Public can comment on results.' },
                { key: 'archived', label: 'Archive After 30 Days', desc: 'Auto-hide from public after 30 days.' },
              ].map(opt => (
                <label key={opt.key} style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <div onClick={() => setVisibility(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                    style={{ width: '42px', height: '24px', borderRadius: '100px', background: visibility[opt.key] ? 'var(--accent)' : 'var(--border)', flexShrink: 0, position: 'relative', transition: 'background var(--transition)', marginTop: '2px', cursor: 'pointer' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: visibility[opt.key] ? '21px' : '3px', transition: 'left var(--transition)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--navy)' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quick export */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">download</span> Export Raw Data</div>
            <div className="form-section-body">
              <p style={{ fontSize: '12.5px', color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '14px' }}>Download a raw CSV dump of all scores and metadata before publishing.</p>
              <button className="secondary-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Downloading scores_export.csv...', 'info')}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>file_download</span>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
