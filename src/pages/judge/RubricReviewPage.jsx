import React, { useState, useEffect } from 'react';
import { useJudgeContext } from './JudgeLayout';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function RubricReviewPage() {
  const { segments, event, showToast } = useJudgeContext();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredButton, setHoveredButton] = useState(null); // export, scoring

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Could not open print window. Please check popup blocker.', 'error');
      return;
    }

    const title = `${event.name} - Official Scoring Rubric`;
    const date = new Date().toLocaleDateString();

    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;800;900&family=Inter:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #0f172a;
              padding: 40px;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .brand {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              font-family: 'DM Sans', sans-serif;
            }
            .brand span {
              color: #3b82f6;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 8px 0;
              font-family: 'DM Sans', sans-serif;
            }
            .meta {
              font-size: 13px;
              color: #64748b;
            }
            .summary {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              border-radius: 12px;
              background-color: #eff6ff;
              border: 1px solid #bfdbfe;
              margin-bottom: 30px;
              font-size: 15px;
            }
            .summary-title {
              font-weight: 700;
              color: #1e3a8a;
            }
            .summary-value {
              font-size: 20px;
              font-weight: 800;
              color: #1e3a8a;
            }
            .segment-card {
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
              margin-bottom: 24px;
              page-break-inside: avoid;
            }
            .segment-header {
              padding: 16px 24px;
              background: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .segment-title {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
            }
            .segment-meta {
              font-size: 12px;
              color: #64748b;
              margin-top: 4px;
            }
            .segment-points {
              font-size: 18px;
              font-weight: 800;
              color: #3b82f6;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background: #f8fafc;
              padding: 10px 24px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
              border-bottom: 1px solid #e2e8f0;
              text-align: left;
            }
            td {
              padding: 12px 24px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13.5px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${title}</h1>
              <div class="meta">Exported on ${date} • Rubric Specifications</div>
            </div>
            <div class="brand">Standings<span>HQ</span></div>
          </div>
          
          <div class="summary">
            <span class="summary-title">Grand Total Possible Score:</span>
            <span class="summary-value">${grandTotal} pts</span>
            <span style="color: #64748b; margin-left: auto;">${segments.length} segments · Standard Average scoring mode</span>
          </div>

          <div>
            ${segments.map((seg, idx) => {
              const segMax = seg.criteria.reduce((a, c) => a + c.maxScore, 0);
              const pct = grandTotal > 0 ? Math.round((segMax / grandTotal) * 100) : 0;
              return `
                <div class="segment-card">
                  <div class="segment-header">
                    <div>
                      <div class="segment-title">${idx + 1}. ${seg.label}</div>
                      <div class="segment-meta">
                        ${seg.criteria.length} criteria 
                        ${seg.weight !== undefined ? `• <span style="color: #3b82f6; font-weight: 600;">Weight: ${seg.weight}%</span>` : ''}
                      </div>
                    </div>
                    <div>
                      <div class="segment-points">${segMax} pts</div>
                      <div style="font-size: 11px; color: #64748b; text-align: right;">${pct}% of total</div>
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th style="width: 40px;">#</th>
                        <th>Criterion</th>
                        <th style="text-align: center; width: 100px;">Max Score</th>
                        <th>Scoring Guidance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${seg.criteria.map((c, ci) => `
                        <tr>
                          <td style="color: #64748b; font-weight: 600;">${ci + 1}</td>
                          <td style="font-weight: 600;">${c.name}</td>
                          <td style="text-align: center;">
                            <span style="display: inline-block; padding: 3px 10px; background: #eff6ff; color: #1d4ed8; font-weight: 700; border-radius: 12px; font-size: 12px;">
                              ${c.maxScore} pts
                            </span>
                          </td>
                          <td style="color: #64748b; font-size: 12.5px;">Score from 0 to ${c.maxScore}. Half points are allowed.</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `;
            }).join('')}
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
    showToast('Rubric downloaded as PDF!', 'success');
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sleek loading guard if segments are still loading or empty
  if (!segments || segments.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${colors.borderSoft}`, borderTopColor: colors.accent, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: colors.inkMuted, fontWeight: '600' }}>Loading criteria specifications...</span>
      </div>
    );
  }

  const grandTotal = segments.reduce((a, seg) =>
    a + seg.criteria.reduce((b, c) => b + c.maxScore, 0), 0
  );

  const isMobile = windowWidth <= 768;

  const pageHeaderStyle = {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'stretch' : 'flex-start',
    gap: '24px',
    flexDirection: isMobile ? 'column' : 'row',
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
    color: colors.inkMid,
    fontSize: '15px',
    maxWidth: '600px',
    lineHeight: '1.55',
  };

  const primaryBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: hoveredButton === 'scoring' ? colors.navySoft : colors.navy,
    color: '#fff',
    border: 'none',
    boxShadow: hoveredButton === 'scoring' ? '0 4px 12px rgba(15, 31, 61, 0.15)' : 'none',
    transform: hoveredButton === 'scoring' ? 'translateY(-1px)' : 'none',
  };

  const secondaryBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: hoveredButton === 'export' ? '#F8FAFC' : '#fff',
    color: colors.inkSoft,
    border: `1px solid ${colors.border}`,
    transform: hoveredButton === 'export' ? 'translateY(-1px)' : 'none',
  };

  const cardStyle = {
    background: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
    marginBottom: '32px',
    position: 'relative',
    overflow: 'hidden',
    padding: '32px',
  };

  const dataTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    background: '#F8FAFC',
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.inkMuted,
  };

  const tdStyle = {
    padding: '16px 24px',
    borderBottom: `1px solid ${colors.borderSoft}`,
    fontSize: '14px',
    color: colors.inkSoft,
  };

  return (
    <div className="slide-up-anim">
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Scoring Rubric</h1>
          <p style={pageDescriptionStyle}>
            Official rubric for <strong style={{ color: colors.navy }}>{event.name}</strong>. Review criteria and weights before scoring.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
          <button 
            style={secondaryBtnStyle} 
            onClick={handleExportPDF}
            onMouseEnter={() => setHoveredButton('export')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="material-symbols-rounded">download</span>
            Export PDF
          </button>
          <button 
            style={primaryBtnStyle} 
            onClick={() => navigate('/judge/scoring')}
            onMouseEnter={() => setHoveredButton('scoring')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="material-symbols-rounded">edit_note</span>
            Go to Score Sheet
          </button>
        </div>
      </div>

      {/* Grand Total Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px', borderRadius: '16px',
        backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.12)',
        marginBottom: '28px', flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>
        <span className="material-symbols-rounded" style={{ color: colors.navy, fontSize: '22px' }}>workspace_premium</span>
        <span style={{ fontWeight: 600, color: colors.navy }}>Grand Total Possible Score:</span>
        <span style={{ fontSize: '22px', fontWeight: 800, color: colors.navy, fontFamily: "'DM Sans', sans-serif" }}>
          {grandTotal} pts
        </span>
        <span style={{ fontSize: '13px', color: colors.inkMuted, marginLeft: isMobile ? '0' : 'auto' }}>
          {segments.length} segments · Standard Average scoring mode
        </span>
      </div>

      {/* Segments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {segments.map((seg, idx) => {
          const segMax = seg.criteria.reduce((a, c) => a + c.maxScore, 0);
          const pct = grandTotal > 0 ? Math.round((segMax / grandTotal) * 100) : 0;
          return (
            <div key={seg.id} style={{ ...cardStyle, padding: 0 }}>
              {/* Segment Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex', alignItems: 'center', gap: '14px',
                backgroundColor: seg.colorBg,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  color: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${seg.color}30`,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>{seg.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: colors.ink, fontSize: '16px' }}>
                    {String(idx + 1).padStart(2, '0')}. {seg.label}
                  </div>
                  <div style={{ fontSize: '13px', color: colors.inkMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{seg.criteria.length} judging criteria</span>
                    {seg.weight !== undefined && (
                      <>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors.border }}></span>
                        <span style={{ fontWeight: 600, color: colors.accent }}>Weight: {seg.weight}%</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right', minWidth: isMobile ? '100%' : 'auto' }}>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: seg.color }}>{segMax} pts</div>
                  <div style={{ fontSize: '12px', color: colors.inkMuted }}>{pct}% of total</div>
                </div>
              </div>

              {/* Criteria Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={dataTableStyle}>
                    <thead>
                    <tr>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Criterion</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Max Score</th>
                        <th style={thStyle}>Scoring Guidance</th>
                    </tr>
                    </thead>
                    <tbody>
                    {seg.criteria.map((c, ci) => (
                        <tr key={c.id}>
                        <td style={{ ...tdStyle, color: colors.inkMuted, fontWeight: 600, width: '40px' }}>
                            {ci + 1}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: colors.ink }}>{c.name}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{
                            display: 'inline-block', padding: '4px 12px',
                            borderRadius: '20px', fontWeight: 700,
                            backgroundColor: `${seg.color}15`, color: seg.color,
                            fontSize: '13px',
                            }}>
                            {c.maxScore} pts
                            </span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: '13px', color: colors.inkMuted }}>
                            Score from 0 to {c.maxScore}. Half points (0.5) are allowed.
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>

              {/* Segment footer */}
              <div style={{
                backgroundColor: colors.offWhite, padding: '10px 24px',
                borderTop: `1px solid ${colors.borderSoft}`,
                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '12px', color: colors.inkMuted }}>Segment Maximum:</span>
                <strong style={{ color: colors.ink, fontSize: '14px' }}>{segMax} pts</strong>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}