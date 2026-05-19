import React, { useState } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { API_URL as API_BASE } from '../../config';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BORDER_TEMPLATES = [
  { id: 'navy', name: 'Royal Navy', bg: '#f8fafc', border: '#1e293b', accent: '#334155', isDark: false, borderStyle: 'solid', type: 'modern' },
  { id: 'minimal', name: 'Silver Minimal', bg: '#fff', border: '#e2e8f0', accent: '#94a3b8', isDark: false, borderStyle: 'solid', type: 'simple' },
  { id: 'ivory', name: 'Ivory Diploma', bg: '#fffdf5', border: '#5c4033', accent: '#8b4513', isDark: false, borderStyle: 'inset', type: 'filigree' },
];

const PAPER_SIZES = {
  a4: { name: 'A4', ratio: 1.414 }, // 210 x 297
  letter: { name: 'Letter', ratio: 1.294 }, // 8.5 x 11
  long: { name: 'Long', ratio: 1.529 }, // 8.5 x 13
};

const AI_TEXTS = {
  champion: (event) => `For demonstrating exemplary excellence and outstanding achievement, earning the highest distinction in the ${event}. This recognition stands as a testament to their dedication, skill, and unwavering commitment to excellence.`,
  participation: (event) => `For successfully participating in ${event}, demonstrating remarkable effort, sportsmanship, and a steadfast commitment to personal growth throughout the competition.`,
  recognition: (event) => `In recognition of the valuable contributions and dedicated service rendered to the ${event}, presented with the sincerest appreciation and highest commendation.`,
};

export default function CertificatesPage() {
  const { selectedEvent, participants = [], showToast, eventsLoading } = useEventContext();

  const [generating, setGenerating] = useState(false);

  const isEventCompleted = (selectedEvent?.status || '').toLowerCase() === 'completed';

  const generateCertificates = async () => {
    if (!isEventCompleted) {
      showToast('Certificates can only be generated for completed events.', 'error');
      return;
    }

    if (!bodyText || !bodyText.trim()) {
      showToast('Certificate Message Body cannot be empty.', 'error');
      return;
    }

    if (signatories.length === 0) {
      showToast('Please add at least one signatory for authorization.', 'error');
      return;
    }

    if (targetList.length === 0) {
      showToast('No participants found matching the selected bulk target group.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/certificates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          bulkRecipient: bulkRecipient,
          certType: certType,
          templateConfig: {
            templateId: selectedTemplate.id,
            bgImage: bgImage,
            bgScale: bgScale,
            bgX: bgX,
            bgY: bgY,
            bgStretch: bgStretch,
            orientation: certOrientation,
            paperSize: paperSize,
            signatories: signatories,
            orgName: orgName
          },
          customText: customText
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast(data.message || 'Certificates successfully generated!', 'success');
      } else {
        showToast(data.error || 'Failed to generate certificates.', 'error');
      }
    } catch (err) {
      console.error('[generateCertificates]', err);
      showToast('Connection error generating certificates.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const [selectedTemplate, setSelectedTemplate] = useState(BORDER_TEMPLATES[0]);
  const [certType, setCertType] = useState('champion');
  const [recipientName, setRecipientName] = useState('');
  const [customText, setCustomText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [orgName, setOrgName] = useState('');
  const [signatories, setSignatories] = useState([]);
  const [newSig, setNewSig] = useState({ name: '', title: '', esign: null });
  const [showAddSig, setShowAddSig] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [bulkRecipient, setBulkRecipient] = useState('all');
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 1024;

  // New Certificate Layout States
  const [bgImage, setBgImage] = useState(null);
  const [bgScale, setBgScale] = useState(100);
  const [bgX, setBgX] = useState(0);
  const [bgY, setBgY] = useState(0);
  const [bgStretch, setBgStretch] = useState(false);
  const [certOrientation, setCertOrientation] = useState('landscape');
  const [paperSize, setPaperSize] = useState('a4');

  // Sidebar Controls
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    design: true,
    sigs: false,
    bulk: false
  });

  const toggleSection = (id) => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  if (eventsLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: `4px solid ${colors.borderSoft}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 32px', fontFamily: "'Inter', sans-serif" }}>
        <span className="material-symbols-rounded" style={{ fontSize: '64px', color: colors.border, marginBottom: '16px', display: 'block' }}>event_busy</span>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.navy, marginBottom: '8px', margin: 0 }}>No Event Selected</h3>
        <p style={{ fontSize: '14px', color: colors.inkMuted, margin: 0 }}>Please select an event from the dashboard selector to access Certificates & Recognition.</p>
      </div>
    );
  }

  const targetList = participants.filter(p => {
    if (bulkRecipient === 'all') return true;
    if (bulkRecipient === 'winners') {
      const ranked = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      return ranked.slice(0, 3).some(r => r.id === p.id);
    }
    if (bulkRecipient === 'registered') return p.status === 'Registered';
    return true;
  });

  const bodyText = customText || AI_TEXTS[certType]?.(selectedEvent.name) || '';

  const handleAIGenerate = async () => {
    if (!selectedEvent) return;
    setAiLoading(true);

    const title = selectedEvent.name;
    const category = selectedEvent.type || "";
    const desc = selectedEvent.description || "";
    const styleInstruction = aiPrompt.trim() || "A classic, elegant, and professional certificate citation.";

    const systemPrompt = `
You are a professional certificate copywriter. Generate a premium, inspiring single-paragraph message body (2-3 sentences max) for an e-certificate.
The user wants this custom style/instruction: "${styleInstruction}"

Event details:
Event Name: "${title}"
Event Category: "${category}"
Event Description: "${desc}"
Certificate Type: "${certType}" (e.g., champion, participation, recognition)

Rules:
1. Do NOT include generic placeholders like [Name], [Recipient Name], [Event], [Date], or bracketed text. Do NOT include the recipient's name in the citation text. The recipient name is already printed separately.
2. Keep it to exactly one polished, cohesive paragraph starting with action words (e.g., "For demonstrating...", "For successfully...", or "In recognition of...").
3. Do not include signatures, titles, headers, or date placeholders.
4. Return exactly a JSON object in this format: { "messageBody": "Suggested citation body text here..." }
5. Do not output markdown code blocks, backticks, or any conversational text. Just raw JSON.
`;

    try {
      if (!GEMINI_API_KEY) {
        throw new Error("No Gemini API key configured.");
      }

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error(`Gemini responded: ${response.status}`);
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);

      if (parsed && parsed.messageBody) {
        setCustomText(parsed.messageBody);
        showToast('✨ AI-generated certificate citation text applied!', 'success');
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.warn("AI generate fallback:", err);
      // Fallback to offline suggestion
      const fallback = AI_TEXTS[certType]?.(recipientName || '[Name]', selectedEvent.name) || '';
      setCustomText(fallback);
      showToast("Applied offline dynamic template preset.", "warning");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSig = () => {
    if (!newSig.name) { showToast('Signatory name required.', 'error'); return; }

    // Auto-retrieve if name matches a judge's profile signature
    const autoSig = localStorage.getItem(`esign_${newSig.name}`);
    const finalSig = newSig.esign || autoSig;

    setSignatories(prev => [...prev, { id: Date.now(), ...newSig, esign: finalSig }]);
    setNewSig({ name: '', title: '', esign: null });
    setShowAddSig(false);
    showToast('Signatory added' + (finalSig ? ' with digital signature.' : '.'), 'success');
  };

  const removeSig = (id) => setSignatories(prev => prev.filter(s => s.id !== id));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadSingle = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Could not open print window. Please check popup blocker.', 'error');
      return;
    }

    const rName = recipientName || 'Recipient Name';
    const isChampion = certType === 'champion';
    const mainTitleText = isChampion ? 'CHAMPION AWARD' : 'CERTIFICATE';
    const subheaderText = isChampion 
      ? `OF CHAMPIONSHIP EXCELLENCE` 
      : certType === 'participation' 
        ? 'OF ACTIVE PARTICIPATION' 
        : 'OF SPECIAL RECOGNITION';

    const aspect = certOrientation === 'landscape' ? '297mm 210mm' : '210mm 297mm';

    const cornersHtml = !bgImage ? `
      <div style="position: absolute; top: 20px; left: 20px; width: 70px; height: 70px; border-top: 4px solid ${selectedTemplate.border}; border-left: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; top: 20px; right: 20px; width: 70px; height: 70px; border-top: 4px solid ${selectedTemplate.border}; border-right: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 70px; height: 70px; border-bottom: 4px solid ${selectedTemplate.border}; border-left: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; bottom: 20px; right: 20px; width: 70px; height: 70px; border-bottom: 4px solid ${selectedTemplate.border}; border-right: 4px solid ${selectedTemplate.border};"></div>
    ` : '';

    const htmlContent = `
      <html>
        <head>
          <title>${rName} - Certificate</title>
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
            <div class="org-name">${orgName ? `${orgName} · ` : ''}${certType === 'champion' ? 'Championship Recognition' : 'Official Recognition'}</div>
            <h1 class="main-title">${mainTitleText}</h1>
            <div class="sub-title">${subheaderText}</div>
            <div class="presented">This prestigious award is proudly presented to</div>
            <div class="recipient">${rName}</div>
            <div class="custom-text">${bodyText}</div>
            
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
    showToast(`Downloading certificate for ${rName} as high-res PDF...`, 'success');
  };

  const handleDownloadForParticipant = (p) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Could not open print window. Please check popup blocker.', 'error');
      return;
    }

    const rName = p.name;
    const sorted = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    const rank = sorted.findIndex(s => s.id === p.id) + 1;
    
    let achievement = 'Participation';
    if (certType === 'champion') {
      if (rank === 1) achievement = '1st Place Champion';
      else if (rank === 2) achievement = '2nd Place';
      else if (rank === 3) achievement = '3rd Place';
      else achievement = 'Champion Finalist';
    } else if (certType === 'recognition') {
      achievement = 'Recognition';
    }

    const isChampion = certType === 'champion';
    const mainTitleText = isChampion ? 'CHAMPION AWARD' : 'CERTIFICATE';
    const subheaderText = isChampion 
      ? `OF CHAMPIONSHIP EXCELLENCE` 
      : certType === 'participation' 
        ? 'OF ACTIVE PARTICIPATION' 
        : 'OF SPECIAL RECOGNITION';

    const aspect = certOrientation === 'landscape' ? '297mm 210mm' : '210mm 297mm';

    const cornersHtml = !bgImage ? `
      <div style="position: absolute; top: 20px; left: 20px; width: 70px; height: 70px; border-top: 4px solid ${selectedTemplate.border}; border-left: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; top: 20px; right: 20px; width: 70px; height: 70px; border-top: 4px solid ${selectedTemplate.border}; border-right: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 70px; height: 70px; border-bottom: 4px solid ${selectedTemplate.border}; border-left: 4px solid ${selectedTemplate.border};"></div>
      <div style="position: absolute; bottom: 20px; right: 20px; width: 70px; height: 70px; border-bottom: 4px solid ${selectedTemplate.border}; border-right: 4px solid ${selectedTemplate.border};"></div>
    ` : '';

    const htmlContent = `
      <html>
        <head>
          <title>${rName} - Certificate</title>
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
            <div class="org-name">${orgName ? `${orgName} · ` : ''}${certType === 'champion' ? 'Championship Recognition' : 'Official Recognition'}</div>
            <h1 class="main-title">${mainTitleText}</h1>
            <div class="sub-title">${subheaderText}</div>
            <div class="presented">This prestigious award is proudly presented to</div>
            <div class="recipient">${rName}</div>
            <div class="custom-text">${bodyText}</div>
            
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
    showToast(`Downloading certificate for ${rName} as high-res PDF...`, 'success');
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
    btn: (hovered, primary = false) => ({
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
      background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1px solid ${hovered ? colors.navy : colors.border}`,
      boxShadow: hovered ? '0 4px 12px rgba(15, 31, 61, 0.15)' : '0 1px 3px rgba(26,24,20,0.06)',
      transform: hovered ? 'translateY(-1px)' : 'none',
    }),
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
    btnIcon: (hovered, danger = false) => ({
      background: hovered ? (danger ? 'rgba(239,68,68,0.1)' : 'rgba(15,31,61,0.05)') : 'none',
      border: 'none',
      color: hovered ? (danger ? colors.coral : colors.navy) : colors.inkMuted,
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '8px',
      display: 'grid',
      placeItems: 'center',
      transition: 'all 0.15s',
    }),
    pageContainer: {
      padding: '0',
      maxWidth: '100%',
      margin: '0 auto',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: '32px',
      alignItems: 'flex-start'
    },
    collapseHeader: {
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      background: '#fff',
      transition: 'background 0.2s',
      fontWeight: 700,
      fontSize: '13px',
      color: colors.navy,
      borderBottom: `1px solid ${colors.borderSoft}`,
    },
    sectionIcon: {
      width: '24px', height: '24px', borderRadius: '6px', background: colors.pageBg, display: 'grid', placeItems: 'center',
      fontSize: '15px', color: colors.navy
    }
  };

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur = (e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Certificates & Recognition</h1>
          <p style={styles.pageDescription}>
            Design professional e-certificates for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
          </p>
        </div>
        <button
          style={{
            ...styles.btn(activeBtnHover === 'gen' && isEventCompleted, true),
            opacity: isEventCompleted ? 1 : 0.5,
            cursor: isEventCompleted ? 'pointer' : 'not-allowed',
          }}
          disabled={!isEventCompleted || generating}
          onMouseEnter={() => isEventCompleted && setActiveBtnHover('gen')}
          onMouseLeave={() => setActiveBtnHover(null)}
          onClick={generateCertificates}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
            {generating ? 'hourglass_empty' : 'workspace_premium'}
          </span>
          {generating ? 'Generating...' : `Generate All (${targetList.length})`}
        </button>
      </div>

      {/* Dynamic Event Status Warning / Success Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        borderRadius: '16px',
        background: isEventCompleted ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)',
        border: `1px solid ${isEventCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.25)'}`,
        color: isEventCompleted ? '#065F46' : '#92400E',
        marginBottom: '32px',
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        lineHeight: '1.5',
      }}>
        <span className="material-symbols-rounded" style={{
          fontSize: '24px',
          color: isEventCompleted ? '#10B981' : '#F59E0B',
          flexShrink: 0
        }}>
          {isEventCompleted ? 'check_circle' : 'warning'}
        </span>
        <div>
          <strong style={{ display: 'block', marginBottom: '2px', fontWeight: '750', fontSize: '14.5px' }}>
            {isEventCompleted ? 'Event Completed: Generation Unlocked' : 'Certificate Generation Locked'}
          </strong>
          {isEventCompleted ? (
            <span>Official certificate generation is active. Exported designs will be immediately published to the participants' digital portals.</span>
          ) : (
            <span>You can customize and preview the layout on the canvas, but official certificate generation is restricted until the event status is marked as <strong>Completed</strong>.</span>
          )}
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* ── LEFT: PURE PREVIEW (Col 1-7) ── */}
        <div style={{
          gridColumn: isMobile ? 'span 12' : 'span 7',
          position: 'sticky',
          top: '24px',
          background: 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '24px',
          padding: '24px',
          border: `1.5px solid ${colors.borderSoft}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignSelf: 'start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>auto_awesome</span>
              <span style={{ fontWeight: 800, fontSize: '15px', color: colors.navy, letterSpacing: '-0.01em' }}>Design Canvas Studio</span>
            </div>
            <div style={{
              fontSize: '10px',
              fontWeight: 800,
              color: colors.inkMuted,
              background: '#fff',
              border: `1px solid ${colors.borderSoft}`,
              borderRadius: '100px',
              padding: '4px 12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {certOrientation} · {paperSize} · Live Preview
            </div>
          </div>

          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.04)',
            margin: '0 auto',
            width: '100%',
            maxWidth: certOrientation === 'landscape' ? '820px' : '580px',
            transition: 'max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `1px solid rgba(255, 255, 255, 0.8)`,
            background: '#fff'
          }}>
            <div style={{
              aspectRatio: certOrientation === 'landscape' ? PAPER_SIZES[paperSize].ratio : 1 / PAPER_SIZES[paperSize].ratio,
              background: bgImage ? `url(${bgImage})` : selectedTemplate.bg,
              backgroundPosition: `${bgX}% ${bgY}%`,
              backgroundSize: bgImage ? (bgStretch ? '100% 100%' : `${bgScale}%`) : 'cover',
              backgroundRepeat: 'no-repeat',
              padding: `60px`,
              border: bgImage ? 'none' : `16px ${selectedTemplate.borderStyle} ${selectedTemplate.border}`,
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              transition: 'all 0.3s ease',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}>
              {!bgImage && [['0px', null, '0px', null], ['0px', null, null, '0px'], [null, '12px', '0px', null], [null, '12px', null, '0px']].map((pos, i) => (
                <div key={i} style={{
                  position: 'absolute', top: pos[0] !== null ? '20px' : undefined, bottom: pos[1] !== null ? '20px' : undefined, left: pos[2] !== null ? '20px' : undefined, right: pos[3] !== null ? '20px' : undefined,
                  width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ position: 'absolute', inset: 0, borderTop: pos[0] !== null ? `4px solid ${selectedTemplate.border}` : 'none', borderBottom: pos[1] !== null ? `4px solid ${selectedTemplate.border}` : 'none', borderLeft: pos[2] !== null ? `4px solid ${selectedTemplate.border}` : 'none', borderRight: pos[3] !== null ? `4px solid ${selectedTemplate.border}` : 'none' }} />
                  {selectedTemplate.type === 'ornate' && <div style={{ width: '30px', height: '30px', border: `2px solid ${selectedTemplate.border}`, transform: 'rotate(45deg)', opacity: 0.8 }} />}
                  {selectedTemplate.type === 'filigree' && <div style={{ display: 'flex', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedTemplate.border }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedTemplate.border }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedTemplate.border }} /></div>}
                  {selectedTemplate.type === 'circuit' && <div style={{ width: '30px', height: '30px', border: `1px solid ${selectedTemplate.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '4px', height: '4px', background: selectedTemplate.border, borderRadius: '50%' }} /></div>}
                  {selectedTemplate.type === 'simple' && <div style={{ width: '10px', height: '10px', border: `2px solid ${selectedTemplate.border}`, borderRadius: '50%' }} />}
                  {selectedTemplate.type === 'fancy' && <div style={{ width: '40px', height: '40px', border: `2px solid ${selectedTemplate.border}`, borderRadius: '50%', display: 'grid', placeItems: 'center' }}><div style={{ width: '20px', height: '20px', border: `1px solid ${selectedTemplate.border}`, transform: 'rotate(45deg)' }} /></div>}
                </div>
              ))}
              {!bgImage && selectedTemplate.type === 'circuit' && <div style={{ position: 'absolute', inset: '10px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1 }} />}
              {!bgImage && selectedTemplate.type === 'simple' && <div style={{ position: 'absolute', inset: '16px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.05 }} />}
              {!bgImage && selectedTemplate.type === 'fancy' && <><div style={{ position: 'absolute', inset: '8px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1, borderRadius: '4px' }} /><div style={{ position: 'absolute', inset: '24px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1, borderRadius: '2px' }} /></>}
              {!bgImage && selectedTemplate.type === 'ornate' && <div style={{ position: 'absolute', inset: '40px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.2, borderRadius: '2px' }} />}
              {!bgImage && selectedTemplate.type === 'filigree' && <div style={{ position: 'absolute', inset: '0', padding: '12px' }}><div style={{ width: '100%', height: '100%', border: `1px dashed ${selectedTemplate.border}`, opacity: 0.15 }} /></div>}

              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: (bgImage || !selectedTemplate.isDark) ? colors.navy : selectedTemplate.accent, marginBottom: '20px', opacity: 0.9 }}>
                  {orgName ? `${orgName} · ` : ''}{certType === 'champion' ? 'Championship Recognition' : 'Official Recognition'}
                </div>
                <div style={{ fontSize: '56px', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {certType === 'champion' ? 'CHAMPION AWARD' : 'CERTIFICATE'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: (bgImage || !selectedTemplate.isDark) ? colors.inkSoft : 'rgba(255,255,255,0.6)', marginBottom: '24px', letterSpacing: '0.1em' }}>
                  {certType === 'champion' ? 'OF CHAMPIONSHIP EXCELLENCE' : certType === 'participation' ? 'OF ACTIVE PARTICIPATION' : 'OF SPECIAL RECOGNITION'}
                </div>
                <div style={{ fontSize: '15px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMid : 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>This prestigious award is proudly presented to</div>
                <div style={{ fontSize: '42px', fontFamily: "Georgia, serif", fontStyle: 'italic', color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff', marginBottom: '20px', borderBottom: `2px solid ${bgImage || !selectedTemplate.isDark ? colors.borderSoft : selectedTemplate.border}`, paddingBottom: '16px', minWidth: '320px', fontWeight: 700 }}>{recipientName || 'Recipient Name'}</div>
                <div style={{ fontSize: '14px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkSoft : 'rgba(255,255,255,0.8)', maxWidth: '540px', lineHeight: 1.8, marginBottom: '40px', fontStyle: 'italic' }}>{bodyText || 'Your certificate text will appear here.'}</div>
                <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {signatories.map(s => (
                    <div key={s.id} style={{ textAlign: 'center', minWidth: '140px', position: 'relative' }}>
                      {s.esign && (
                        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '100px', pointerEvents: 'none' }}>
                          <img src={s.esign} alt="Sign" style={{ width: '100%', filter: 'contrast(1.2) brightness(0.9) grayscale(0.2)', mixBlendMode: 'multiply' }} />
                        </div>
                      )}
                      <div style={{ width: '100%', borderTop: `1px solid ${bgImage || !selectedTemplate.isDark ? colors.borderSoft : selectedTemplate.border}`, marginBottom: '10px', opacity: 0.6 }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMuted : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.title}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: TOOLS (Col 8-12) ── */}
        <div style={{ gridColumn: isMobile ? 'span 12' : 'span 5', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Section: Content */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('content')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">edit_note</span></div>
                Certificate Content
              </div>
              <span className="material-symbols-rounded">{expandedSections.content ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.content && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={styles.label}>Type</label>
                      <select style={styles.input} value={certType} onChange={e => setCertType(e.target.value)}>
                        <option value="champion">Champion Award</option>
                        <option value="participation">Participation</option>
                        <option value="recognition">Recognition</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Organization Name</label>
                      <input type="text" style={styles.input} placeholder="e.g. School, Company, Club" value={orgName} onChange={e => setOrgName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={styles.label}>Recipient Name</label>
                    <input type="text" style={styles.input} placeholder="Recipient Name (Optional)" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ ...styles.label, marginBottom: '8px', display: 'block' }}>Message Body</label>
                    <textarea style={{ ...styles.input, height: 'auto', padding: '12px', resize: 'vertical' }} rows={3} value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Enter or customize the certificate body citation text..." />

                    {/* Glowing AI write prompt bar */}
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(59, 130, 246, 0.04)',
                      border: `1px solid rgba(59, 130, 246, 0.15)`,
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '15px', color: colors.accent }}>auto_awesome</span>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: colors.navy }}>
                          AI Prompt Writer & Stylist
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                        <input
                          type="text"
                          disabled={aiLoading}
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                          placeholder="Describe style (e.g. 'formal', 'humorous', 'epic award')..."
                          style={{
                            ...styles.input,
                            flex: 1,
                            height: '36px',
                            fontSize: '12px',
                            background: '#fff',
                            borderColor: 'rgba(59, 130, 246, 0.25)',
                            paddingRight: '36px'
                          }}
                        />
                        <button
                          disabled={aiLoading}
                          onClick={handleAIGenerate}
                          style={{
                            position: 'absolute',
                            right: '4px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: colors.navy,
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center',
                            transition: 'all 0.2s',
                          }}
                          title="Generate text via AI"
                        >
                          {aiLoading ? (
                            <div style={{ width: '12px', height: '12px', border: '2px solid transparent', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          ) : (
                            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>send</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Visual & Templates */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('design')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">brush</span></div>
                Visual & Format
              </div>
              <span className="material-symbols-rounded">{expandedSections.design ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.design && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={styles.label}>Paper Size</label>
                      <select style={styles.input} value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                        <option value="a4">A4 (210x297)</option>
                        <option value="letter">Letter (8.5x11)</option>
                        <option value="long">Long (8.5x13)</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Orientation</label>
                      <select style={styles.input} value={certOrientation} onChange={e => setCertOrientation(e.target.value)}>
                        <option value="landscape">Landscape</option>
                        <option value="portrait">Portrait</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={styles.label}>Built-in Borders</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {BORDER_TEMPLATES.map(t => (
                        <div key={t.id} onClick={() => setSelectedTemplate(t)} style={{
                          cursor: 'pointer', borderRadius: '10px', height: '40px', background: t.bg, border: `2px solid ${selectedTemplate.id === t.id ? colors.accent : colors.borderSoft}`,
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{ width: '80%', height: '60%', border: `1px solid ${t.border}`, borderRadius: '2px', opacity: 0.5 }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '16px' }}>
                    <label style={styles.label}>Background Border Image</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ ...styles.btn(activeBtnHover === 'upl-img'), flex: 1, cursor: 'pointer', height: '36px' }} onMouseEnter={() => setActiveBtnHover('upl-img')} onMouseLeave={() => setActiveBtnHover(null)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload_file</span>
                        Upload Image
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                      </label>
                      {bgImage && (
                        <button style={styles.btnIcon(activeBtnHover === 'clr-img', true)} onClick={() => setBgImage(null)} onMouseEnter={() => setActiveBtnHover('clr-img')} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded">delete</span>
                        </button>
                      )}
                    </div>
                    {bgImage && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input type="checkbox" id="stretch" checked={bgStretch} onChange={e => setBgStretch(e.target.checked)} />
                          <label htmlFor="stretch" style={{ fontSize: '11.5px', fontWeight: 600, color: colors.navy }}>Stretch to Full Page</label>
                        </div>
                        {!bgStretch && <>
                          <div><label style={styles.label}>Scale: {bgScale}%</label><input type="range" min="50" max="250" value={bgScale} onChange={e => setBgScale(e.target.value)} style={{ width: '100%' }} /></div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div><label style={styles.label}>X: {bgX}%</label><input type="range" min="0" max="100" value={bgX} onChange={e => setBgX(e.target.value)} style={{ width: '100%' }} /></div>
                            <div><label style={styles.label}>Y: {bgY}%</label><input type="range" min="0" max="100" value={bgY} onChange={e => setBgY(e.target.value)} style={{ width: '100%' }} /></div>
                          </div>
                        </>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Signatories */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('sigs')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">verified_user</span></div>
                Authentication
              </div>
              <span className="material-symbols-rounded">{expandedSections.sigs ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.sigs && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {signatories.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: colors.pageBg, borderRadius: '12px' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.navy }}>{s.name}</div>
                          <div style={{ fontSize: '11px', color: colors.inkMuted }}>{s.title}</div>
                        </div>
                        {s.esign && (
                          <div style={{ background: colors.successBg, color: colors.success, fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>SIGNED</div>
                        )}
                      </div>
                      <button style={styles.btnIcon(activeBtnHover === `rs-${s.id}`, true)} onClick={() => removeSig(s.id)} onMouseEnter={() => setActiveBtnHover(`rs-${s.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                      </button>
                    </div>
                  ))}
                  {showAddSig ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>
                      <input type="text" style={styles.input} placeholder="Signatory Name" value={newSig.name} onChange={e => setNewSig(p => ({ ...p, name: e.target.value }))} autoFocus />
                      <input type="text" style={styles.input} placeholder="Title" value={newSig.title} onChange={e => setNewSig(p => ({ ...p, title: e.target.value }))} />

                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '10px',
                        background: '#fff', border: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'all 0.2s'
                      }}>
                        <input type="file" hidden accept="image/*" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewSig(p => ({ ...p, esign: reader.result }));
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <span className="material-symbols-rounded" style={{ fontSize: '18px', color: newSig.esign ? colors.success : colors.inkMuted }}>
                          {newSig.esign ? 'task_alt' : 'draw'}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: colors.navy }}>
                          {newSig.esign ? 'E-Signature Attached' : 'Attach Signature (Optional)'}
                        </span>
                      </label>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ ...styles.btn(false), flex: 1, height: '32px' }} onClick={() => setShowAddSig(false)}>Cancel</button>
                        <button style={{ ...styles.btn(false, true), flex: 1, height: '32px' }} onClick={handleAddSig}>Add</button>
                      </div>
                    </div>
                  ) : (
                    <button style={{ ...styles.btn(activeBtnHover === 'adds'), width: '100%', height: '36px', borderStyle: 'dashed' }} onClick={() => setShowAddSig(true)} onMouseEnter={() => setActiveBtnHover('adds')} onMouseLeave={() => setActiveBtnHover(null)}>
                      <span className="material-symbols-rounded">add</span> Signatory
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Export */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('bulk')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">rocket_launch</span></div>
                Generate & Export
              </div>
              <span className="material-symbols-rounded">{expandedSections.bulk ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.bulk && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={styles.label}>Bulk Target</label>
                    <select style={styles.input} value={bulkRecipient} onChange={e => setBulkRecipient(e.target.value)}>
                      <option value="all">All Recipients ({participants.length})</option>
                      <option value="winners">Winners Only (Top 3)</option>
                      <option value="registered">Registered Only</option>
                    </select>
                  </div>

                  {/* Visual Recipient Preview */}
                  <div style={{ marginTop: '8px', borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Selected Recipients ({targetList.length})
                      </span>
                      <span style={{ fontSize: '10px', background: colors.accentBg, color: colors.accent, fontWeight: 700, padding: '2px 8px', borderRadius: '100px' }}>
                        {bulkRecipient === 'winners' ? 'Championship Ranks' : 'Target Roster'}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                      scrollbarWidth: 'thin'
                    }}>
                      {targetList.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: colors.inkMuted, fontSize: '12px', background: colors.pageBg, borderRadius: '10px' }}>
                          No participants match this group.
                        </div>
                      ) : targetList.map((p) => {
                        const sorted = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
                        const rank = sorted.findIndex(s => s.id === p.id) + 1;
                        let badge = '🎖️';
                        let badgeColor = colors.navy;
                        if (rank === 1) { badge = '🥇'; badgeColor = '#D4AF37'; }
                        else if (rank === 2) { badge = '🥈'; badgeColor = '#94A3B8'; }
                        else if (rank === 3) { badge = '🥉'; badgeColor = '#B45309'; }

                        return (
                          <div key={p.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: colors.pageBg,
                            borderRadius: '10px',
                            border: `1px solid ${colors.borderSoft}`,
                            fontSize: '12px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '16px', flexShrink: 0 }}>{badge}</span>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                <div style={{ fontSize: '10px', color: colors.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '8px' }}>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 800, color: rank <= 3 ? badgeColor : colors.inkSoft }}>
                                  {rank <= 3 ? `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'} Place` : 'Participant'}
                                </span>
                                <div style={{ fontSize: '10px', color: colors.inkMuted }}>Score: {p.score ?? '—'}</div>
                              </div>
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: colors.navy,
                                  cursor: 'pointer',
                                  padding: '6px',
                                  borderRadius: '50%',
                                  display: 'grid',
                                  placeItems: 'center',
                                  transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = colors.borderSoft}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                onClick={() => handleDownloadForParticipant(p)}
                                title={`Download Certificate for ${p.name}`}
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>download</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    <button
                      style={{
                        ...styles.btnOutline,
                        width: '100%',
                        height: '40px',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '700'
                      }}
                      onClick={handleDownloadSingle}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
                      Download Current Design
                    </button>
                    
                    <button
                      style={{
                        ...styles.btn(activeBtnHover === 'bulk-g' && isEventCompleted, true),
                        width: '100%',
                        height: '44px',
                        opacity: isEventCompleted ? 1 : 0.5,
                        cursor: isEventCompleted ? 'pointer' : 'not-allowed',
                        justifyContent: 'center'
                      }}
                      disabled={!isEventCompleted || generating}
                      onClick={generateCertificates}
                      onMouseEnter={() => isEventCompleted && setActiveBtnHover('bulk-g')}
                      onMouseLeave={() => setActiveBtnHover(null)}
                    >
                      <span className="material-symbols-rounded">rocket_launch</span>
                      {generating ? 'Generating...' : 'Bulk Issue to Group'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
