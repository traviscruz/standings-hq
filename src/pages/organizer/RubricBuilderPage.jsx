import React, { useState, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { createClient } from '../../utils/supabase/client';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper to validate UUID formats before Postgres database updates
const isValidUUID = (str) => {
  if (!str) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

// Automatic proportional weight balancing helper to ensure weights total exactly 100
const balanceCriteriaWeights = (criteriaList) => {
  if (criteriaList.length === 0) return [];
  const sanitized = criteriaList.map(c => ({
    ...c,
    weight: Math.max(1, Number(c.weight) || 1)
  }));
  
  const sum = sanitized.reduce((acc, c) => acc + c.weight, 0);
  
  if (sum === 100) return sanitized;
  if (sum === 0) {
    const equalWeight = Math.floor(100 / sanitized.length);
    return sanitized.map((c, idx) => ({
      ...c,
      weight: idx === sanitized.length - 1 ? 100 - (equalWeight * (sanitized.length - 1)) : equalWeight
    }));
  }

  // Normalize proportionally
  let updated = sanitized.map(c => ({
    ...c,
    weight: Math.round((c.weight / sum) * 100)
  }));

  // Re-adjust exact sum to 100 by adjusting the last criteria
  const currentSum = updated.reduce((acc, c) => acc + c.weight, 0);
  if (currentSum !== 100) {
    updated[updated.length - 1].weight = Math.max(1, updated[updated.length - 1].weight + (100 - currentSum));
  }
  return updated;
};

// Smart Offline Fallback Generator when Gemini API is not active
const getOfflineSuggestion = (step, title = "", category = "") => {
  const query = `${title} ${category}`.toLowerCase();
  
  if (step === 0) {
    let competitionType = "Creative Showcase";
    let desc = "This event evaluates participant skills and technique across multiple rounds.";
    if (query.includes("pageant") || query.includes("mutya") || query.includes("beauty")) {
      competitionType = "Beauty Pageant";
      desc = "The setup will focus on stage poise, elegant gowns, and verbal articulation rounds.";
    } else if (query.includes("sing") || query.includes("vocal") || query.includes("music") || query.includes("song")) {
      competitionType = "Vocal Performance";
      desc = "The setup will focus on vocal control, tone quality, and stage performance.";
    } else if (query.includes("dance") || query.includes("battle") || query.includes("groove")) {
      competitionType = "Dance Competition";
      desc = "The setup will focus on group synchronization, choreographic dynamics, and energy.";
    } else if (query.includes("hack") || query.includes("code") || query.includes("tech")) {
      competitionType = "Hackathon";
      desc = "The setup will focus on code quality, design innovation, and presentation quality.";
    }
    return { competitionType, description: desc };
  }

  if (step === 1) { // Participation
    if (query.includes("dance") || query.includes("hack") || query.includes("code") || query.includes("battle")) {
      return { format: "group", maxMembers: 5, maxParticipants: 30, reason: "Group collaborations foster high team performance and synergy for this event." };
    }
    return { format: "solo", maxMembers: null, maxParticipants: 50, reason: "Individual presentations showcase raw personal talent and poise best." };
  }

  if (step === 2) { // Judges
    if (query.includes("pageant") || query.includes("hack") || query.includes("dance")) {
      return { judges: 5, reason: "A larger odd-numbered jury (5 judges) prevents ties and provides balanced consensus." };
    }
    return { judges: 3, reason: "A standard panel of 3 evaluators ensures reliable assessments without heavy coordination." };
  }

  if (step === 3) { // Comb Method
    if (query.includes("pageant") || query.includes("sports")) {
      return { scoringMethod: "drop", reason: "Dropping the highest and lowest scores, then averaging, prevents judge bias and outliers." };
    }
    return { scoringMethod: "average", reason: "Standard Average combining provides equal representation for all active judges' scores." };
  }

  if (step === 4) { // Scale
    if (query.includes("hack") || query.includes("code") || query.includes("exam")) {
      return { min: 1, max: 100, reason: "A 100-point scale accommodates detailed technical rubrics and fine-grained scoring." };
    }
    return { min: 1, max: 10, reason: "A concise 10-point scale makes real-time scoring simple and keeps judge assessments cohesive." };
  }

  if (step === 5) { // Rubrics
    if (query.includes("pageant") || query.includes("mutya") || query.includes("beauty")) {
      return {
        rubrics: [
          { id: "crit-1", label: "Poise & Stage Presence", weight: 35 },
          { id: "crit-2", label: "Evening Gown / Fit", weight: 35 },
          { id: "crit-3", label: "Intelligence & Articulation", weight: 30 }
        ]
      };
    }
    if (query.includes("sing") || query.includes("vocal") || query.includes("music") || query.includes("song")) {
      return {
        rubrics: [
          { id: "crit-1", label: "Tone & Vocal Accuracy", weight: 40 },
          { id: "crit-2", label: "Stage Poise & Performance", weight: 30 },
          { id: "crit-3", label: "Musicality & Dynamics", weight: 30 }
        ]
      };
    }
    if (query.includes("dance") || query.includes("battle")) {
      return {
        rubrics: [
          { id: "crit-1", label: "Choreography & Style", weight: 35 },
          { id: "crit-2", label: "Synchronization & Form", weight: 35 },
          { id: "crit-3", label: "Energy & Stage Presence", weight: 30 }
        ]
      };
    }
    return {
      rubrics: [
        { id: "crit-1", label: "Technical Precision & Skills", weight: 40 },
        { id: "crit-2", label: "Presentation & Poise", weight: 30 },
        { id: "crit-3", label: "Overall Impression", weight: 30 }
      ]
    };
  }
};

export default function RubricBuilderPage() {
  const { selectedEvent, showToast, eventsLoading, setRubricConfig } = useEventContext();
  const supabase = createClient();

  // Wizard States
  // 0: Greeting confirm, 1: Participation Type, 2: Judge Count, 3: Combining Method, 4: Scoring Scale, 5: Rubric Criteria, 6: Summary Confirm, 7: Final JSON Live
  const [setupStep, setSetupStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initial loading state to prevent flash of AI panel before Supabase fetch resolves
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [existingRubric, setExistingRubric] = useState(null);
  
  // Dashboard view toggle when an existing rubric is detected in the database
  const [hasActiveRubricScreen, setHasActiveRubricScreen] = useState(true);

  // Active configurations in process
  const [config, setConfig] = useState({
    competition: "",
    format: "solo",
    maxMembers: null,
    maxParticipants: 50,
    judges: 3,
    scoringMethod: "average",
    scale: { min: 1, max: 10 },
    rubrics: []
  });

  // Dynamic Suggestion values and custom workspace temp values
  const [suggestion, setSuggestion] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customVal, setCustomVal] = useState({});
  const [finalJSONText, setFinalJSONText] = useState("");

  // Validation warning state
  const [valWarning, setValWarning] = useState("");

  // Custom AI prompt states
  const [promptText, setPromptText] = useState("");
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  // Safety Lock Check: Evaluates all states (even pending/upcoming status is locked if start_date is past or today)
  const isRubricLocked = () => {
    if (!selectedEvent) return false;
    
    // Normalize status to lowercase for comparison (supports 'ongoing', 'completed', 'cancelled', 'active', etc.)
    const status = (selectedEvent.status || "").toLowerCase();
    
    // 1. Lock immediately if marked as anything other than 'upcoming' (e.g. ongoing, completed, active, cancelled)
    const isNotUpcoming = status !== 'upcoming';
    
    // 2. Date check: is the event scheduled to have started (start date is past or today)?
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventStartDate = selectedEvent.startDate ? new Date(selectedEvent.startDate + 'T00:00:00') : null;
    const isStartDatePastOrToday = eventStartDate ? today >= eventStartDate : false;

    // Lock if the event has been initiated in database status OR if the calendar date has already arrived/passed
    return isNotUpcoming || isStartDatePastOrToday;
  };

  const isLocked = isRubricLocked();

  // Fetch existing event rubric on mount
  useEffect(() => {
    if (!selectedEvent) {
      setIsInitialLoading(false);
      return;
    }

    const fetchRubric = async () => {
      setIsInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from('event_rubrics')
          .select('*')
          .eq('event_id', selectedEvent.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setExistingRubric(data);
          setHasActiveRubricScreen(true);
          const cfg = data.config || {};
          setConfig({
            competition: cfg.competition || selectedEvent.name,
            format: cfg.format || "solo",
            maxMembers: cfg.maxMembers || null,
            maxParticipants: cfg.maxParticipants || 50,
            judges: cfg.judges || 3,
            scoringMethod: cfg.scoringMethod || "average",
            scale: cfg.scale || { min: 1, max: 10 },
            rubrics: cfg.rubrics || []
          });
        } else {
          setExistingRubric(null);
          setHasActiveRubricScreen(false);
          setSetupStep(0);
        }
      } catch (err) {
        console.error("Error loading rubric:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchRubric();
  }, [selectedEvent, supabase]);

  // Set default competition title
  useEffect(() => {
    if (!selectedEvent) return;
    setConfig(prev => ({ ...prev, competition: selectedEvent.name }));
  }, [selectedEvent]);

  // Run dynamic suggestion via Gemini API
  const getAISuggestion = async (stepNumber, isRegenerating = false) => {
    if (!selectedEvent) return null;
    setLoading(true);
    const title = selectedEvent.name;
    const desc = selectedEvent.description || "";
    const category = selectedEvent.type || "";

    const systemPrompt = `
You are a professional competition setup assistant. 
Suggest values for competition setup based on:
Title: "${title}"
Category: "${category}"
Description: "${desc}"

For Setup Step ${stepNumber}:
${stepNumber === 1 ? 'Suggest: solo or group, and a max number of participants (default 50). Return JSON format: { "format": "solo|group", "maxMembers": null_or_number, "maxParticipants": number, "reason": "Explain in one brief friendly sentence." }' : ''}
${stepNumber === 2 ? 'Suggest judge count. Return JSON format: { "judges": number, "reason": "Explain in one brief friendly sentence." }' : ''}
${stepNumber === 3 ? 'Suggest combining method (average, sum, or drop). Return JSON format: { "scoringMethod": "average|sum|drop", "reason": "Explain in one brief friendly sentence." }' : ''}
${stepNumber === 4 ? 'Suggest scoring scale. Return JSON format: { "scale": { "min": 1, "max": 10_or_100 }, "reason": "Explain in one brief friendly sentence." }' : ''}
${stepNumber === 5 ? 'Suggest 3-5 criteria weights summing to 100. Return JSON format: { "rubrics": [ { "label": "Criteria Label", "weight": weight_number } ], "reason": "Explain briefly." }' : ''}

Generate completely different suggestions if regenerating is true (isRegenerating: ${isRegenerating}).
Return ONLY the raw JSON object. No markdown, no wrappers.
`;

    try {
      if (!GEMINI_API_KEY) {
        throw new Error("No API Key");
      }

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response shape from Gemini API");
      }

      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);
      setLoading(false);
      return parsed;
    } catch (err) {
      console.warn("Offline suggestion fallback:", err.message || err);
      setLoading(false);
      return getOfflineSuggestion(stepNumber, title, category);
    }
  };

  // Triggers new dynamic steps & initializes from existing config if available
  const triggerStepSuggestion = async (step, isRegen = false) => {
    setValWarning("");
    setIsCustomizing(false); // Reset customizing state immediately to prevent validation warning flash of next step
    const sug = await getAISuggestion(step, isRegen);
    setSuggestion(sug);

    let sugFormat = sug?.format || "solo";
    if (sugFormat === "team") sugFormat = "group";

    if (step === 1) {
      const fmt = config.format || sugFormat;
      const maxM = config.maxMembers || (fmt === 'group' ? Math.max(2, sug?.maxMembers || 5) : 1);
      const maxP = config.maxParticipants || sug?.maxParticipants || 50;
      setCustomVal({ format: fmt, maxMembers: maxM, maxParticipants: maxP });
    } else if (step === 2) {
      const jd = config.judges || Math.max(1, sug?.judges || 3);
      setCustomVal({ judges: jd });
    } else if (step === 3) {
      const sm = config.scoringMethod || sug?.scoringMethod || "average";
      setCustomVal({ scoringMethod: sm });
    } else if (step === 4) {
      const minS = config.scale?.min ?? Math.max(0, sug?.scale?.min ?? 1);
      const maxS = config.scale?.max ?? Math.max(minS + 1, sug?.scale?.max ?? 10);
      setCustomVal({ scaleMin: minS, scaleMax: maxS });
    } else if (step === 5) {
      const rb = config.rubrics?.length > 0 ? config.rubrics : sug?.rubrics?.map((r, idx) => ({ id: `crit-${idx}`, label: r.label, weight: Math.max(1, r.weight) })) || [];
      setCustomVal({ rubrics: rb.map(r => ({ ...r, weight: Math.max(1, Number(r.weight) || 1) })) });
    }
  };

  // Run custom prompt optimization via Gemini API
  const handlePromptSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!promptText || !promptText.trim()) return;
    if (!selectedEvent) return;

    setIsPromptLoading(true);
    const title = selectedEvent.name;
    const desc = selectedEvent.description || "";
    const category = selectedEvent.type || "";
    const userPrompt = promptText.trim();

    const systemPrompt = `
You are an expert competition coordinator and professional rubric designer.
The user wants to customize the rubric specifications with this specific instruction: "${userPrompt}"

Consider the competition details:
Event Title: "${title}"
Event Category: "${category}"
Event Description: "${desc}"

Generate a balanced list of rubric criteria tailored to the user's instruction.
Return exactly a JSON object under the key "rubrics". 
The weights of all criteria MUST sum up to exactly 100.
Return ONLY a raw JSON object with this shape:
{
  "rubrics": [
    { "label": "Criteria Name 1", "weight": 30 },
    { "label": "Criteria Name 2", "weight": 30 },
    ...
  ],
  "reason": "Explain briefly in one friendly sentence how this matches their prompt."
}

No markdown wrappers, no backticks, no comments.
`;

    try {
      if (!GEMINI_API_KEY) {
        throw new Error("No API Key configured.");
      }

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response shape from Gemini API");
      }

      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);

      if (parsed && parsed.rubrics) {
        // Format rubrics with IDs
        const formatted = parsed.rubrics.map((r, idx) => ({
          id: `crit-${Date.now()}-${idx}`,
          label: r.label || "Criterion",
          weight: Math.max(1, Number(r.weight) || 1)
        }));

        // Balance weights to 100% just in case
        const balanced = balanceCriteriaWeights(formatted);
        
        setConfig(prev => ({ ...prev, rubrics: balanced }));
        setCustomVal(prev => ({ ...prev, rubrics: balanced }));
        setSuggestion(prev => ({
          ...prev,
          rubrics: balanced,
          reason: parsed.reason || "Weights dynamically adjusted based on your custom prompt."
        }));
        
        // Transition to step 5 so they can customize/review this criteria!
        setSetupStep(5);
        // Turn off the active saved rubric screen so they are in editing mode
        setHasActiveRubricScreen(false);
        setPromptText("");
        showToast("✨ AI generated your customized rubric!", "success");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.warn("AI Prompt fallback or failed:", err);
      let errorMsg = "Could not process AI prompt. Using a standard offline template instead.";
      if (err.message && err.message.includes("429")) {
        errorMsg = "✨ Gemini API rate limit hit (429). Using standard offline template as a fallback.";
      }
      showToast(errorMsg, "warning");
      
      // Fallback: get standard step 5 rubrics
      const offline = getOfflineSuggestion(5, title, category);
      if (offline && offline.rubrics) {
        const formatted = offline.rubrics.map((r, idx) => ({
          id: `crit-${Date.now()}-${idx}`,
          label: r.label,
          weight: r.weight
        }));
        setConfig(prev => ({ ...prev, rubrics: formatted }));
        setCustomVal(prev => ({ ...prev, rubrics: formatted }));
        setSetupStep(5);
        setHasActiveRubricScreen(false);
      }
    } finally {
      setIsPromptLoading(false);
    }
  };

  // Real-time custom form input validations
  const getValidationWarning = () => {
    if (!isCustomizing) return "";

    if (setupStep === 1) {
      if (customVal.format === 'group') {
        const val = Number(customVal.maxMembers);
        if (isNaN(val) || val < 2) return "Group members count must be at least 2";
      }
      const maxP = Number(customVal.maxParticipants);
      if (isNaN(maxP) || maxP < 1) return "Maximum participants count must be at least 1";
    }
    else if (setupStep === 2) {
      const val = Number(customVal.judges);
      if (isNaN(val) || val < 1) return "Judges count must be at least 1";
    }
    else if (setupStep === 4) {
      const minS = Number(customVal.scaleMin);
      const maxS = Number(customVal.scaleMax);
      if (isNaN(minS) || minS < 0) return "Min scale cannot be negative";
      if (isNaN(maxS) || maxS <= minS) return "Max scale must be greater than Min scale";
    }
    else if (setupStep === 5) {
      const list = customVal.rubrics || [];
      if (list.length === 0) return "Please add at least one criterion";
      for (let r of list) {
        if (!r.label || !r.label.trim()) return "All criteria must have a label name";
        const w = Number(r.weight);
        if (isNaN(w) || w < 1) return "All criteria weights must be at least 1%";
      }
    }
    return "";
  };

  const validationError = getValidationWarning();
  const isConfirmDisabled = isCustomizing && !!validationError;

  // Action: Accept Recommendation
  const handleAccept = () => {
    setValWarning("");
    if (!suggestion) return;

    let formatVal = suggestion.format;
    if (formatVal === "team") formatVal = "group";

    if (setupStep === 1) {
      const maxM = formatVal === 'group' ? Math.max(2, suggestion.maxMembers || 5) : 1;
      const maxP = suggestion.maxParticipants || 50;
      setConfig(prev => ({ ...prev, format: formatVal, maxMembers: maxM, maxParticipants: maxP }));
      setSetupStep(2);
      triggerStepSuggestion(2);
    } 
    else if (setupStep === 2) {
      const jCount = Math.max(1, suggestion.judges || 3);
      setConfig(prev => ({ ...prev, judges: jCount }));
      setSetupStep(3);
      triggerStepSuggestion(3);
    }
    else if (setupStep === 3) {
      setConfig(prev => ({ ...prev, scoringMethod: suggestion.scoringMethod || "average" }));
      setSetupStep(4);
      triggerStepSuggestion(4);
    }
    else if (setupStep === 4) {
      const minS = Math.max(0, suggestion.scale?.min ?? 1);
      const maxS = Math.max(minS + 1, suggestion.scale?.max ?? 10);
      setConfig(prev => ({ ...prev, scale: { min: minS, max: maxS } }));
      setSetupStep(5);
      triggerStepSuggestion(5);
    }
    else if (setupStep === 5) {
      const finalRubrics = suggestion.rubrics.map((r, idx) => ({ id: `crit-${idx}`, label: r.label, weight: Math.max(1, r.weight) }));
      setConfig(prev => ({ ...prev, rubrics: finalRubrics }));
      setSetupStep(6);
    }
  };

  // Action: Apply Inline Customizations with input validation
  const handleApplyCustomValue = () => {
    setValWarning("");
    const errorMsg = getValidationWarning();
    if (errorMsg) {
      setValWarning(errorMsg);
      return;
    }

    if (setupStep === 1) {
      const fmt = customVal.format || "solo";
      let maxM = 1;
      if (fmt === 'group') {
        maxM = Number(customVal.maxMembers);
      }
      const maxP = Number(customVal.maxParticipants);
      setConfig(prev => ({ ...prev, format: fmt, maxMembers: fmt === 'solo' ? null : maxM, maxParticipants: maxP }));
      setSetupStep(2);
      triggerStepSuggestion(2);
    }
    else if (setupStep === 2) {
      let jCount = Number(customVal.judges);
      setConfig(prev => ({ ...prev, judges: jCount }));
      setSetupStep(3);
      triggerStepSuggestion(3);
    }
    else if (setupStep === 3) {
      setConfig(prev => ({ ...prev, scoringMethod: customVal.scoringMethod || "average" }));
      setSetupStep(4);
      triggerStepSuggestion(4);
    }
    else if (setupStep === 4) {
      let minS = Number(customVal.scaleMin);
      let maxS = Number(customVal.scaleMax);
      setConfig(prev => ({ ...prev, scale: { min: minS, max: maxS } }));
      setSetupStep(5);
      triggerStepSuggestion(5);
    }
    else if (setupStep === 5) {
      const list = customVal.rubrics || [];
      const cleanRubrics = list.map(r => ({
        ...r,
        label: (r.label || "").trim() || "Criterion",
        weight: Math.max(1, Number(r.weight) || 1)
      }));
      const balanced = balanceCriteriaWeights(cleanRubrics);
      setConfig(prev => ({ ...prev, rubrics: balanced }));
      setSetupStep(6);
    }
  };

  // Action: Navigate Backwards in the Setup Wizard
  const handleBack = () => {
    setValWarning("");
    const prevStep = setupStep - 1;
    setSetupStep(prevStep);
    if (prevStep >= 1) {
      triggerStepSuggestion(prevStep);
    }
  };

  // Action: Regenerate
  const handleRegenerate = () => {
    triggerStepSuggestion(setupStep, true);
  };

  // Action: Save Entire Setup to Database
  const handleFinalConfirm = async () => {
    if (isLocked) {
      showToast("Editing locked! Ongoing or concluded events cannot be modified.", "warning");
      return;
    }
    setIsSaving(true);

    const formatValue = config.format || "solo";
    const maxMembersValue = formatValue === 'solo' ? null : Math.max(2, config.maxMembers || 2);
    const maxParticipantsValue = Math.max(1, config.maxParticipants || 50);
    const judgesValue = Math.max(1, config.judges || 3);
    const scoringMethodValue = config.scoringMethod || "average";
    const scaleMin = Math.max(0, config.scale?.min ?? 1);
    const scaleMax = Math.max(scaleMin + 1, config.scale?.max ?? 10);

    const finalJSON = {
      competition: selectedEvent.name,
      format: formatValue,
      maxMembers: maxMembersValue,
      maxParticipants: Number(maxParticipantsValue),
      judges: Number(judgesValue),
      scoringMethod: scoringMethodValue,
      scale: { min: Number(scaleMin), max: Number(scaleMax) },
      rubrics: config.rubrics.map(r => ({ id: r.id, label: r.label, weight: Math.max(1, r.weight) }))
    };

    setFinalJSONText(JSON.stringify(finalJSON, null, 2));

    // Save to Database
    const userId = localStorage.getItem('user_id');
    const createdBy = isValidUUID(userId) ? userId : null;

    try {
      let error;
      if (existingRubric) {
        const { error: err } = await supabase
          .from('event_rubrics')
          .update({ config: finalJSON, status: 'published', updated_at: new Date().toISOString() })
          .eq('event_id', selectedEvent.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('event_rubrics')
          .insert({
            event_id: selectedEvent.id,
            config: finalJSON,
            status: 'published',
            created_by: createdBy
          });
        error = err;
      }

      if (error) throw error;
      showToast("Rubric configured and saved successfully!", "success");
      
      // Update global context
      if (setRubricConfig) {
        setRubricConfig(finalJSON);
      }

      // Update local state to reflect that there is an existing rubric now
      setExistingRubric({
        event_id: selectedEvent.id,
        config: finalJSON,
        status: 'published'
      });
      
      setSetupStep(7);
    } catch (err) {
      console.error(err);
      showToast("Failed to save to database. Outputting details locally.", "warning");
      setSetupStep(7);
    } finally {
      setIsSaving(false);
    }
  };

  // Custom weight list modifiers
  const addCriterionInput = () => {
    setCustomVal(prev => ({
      ...prev,
      rubrics: [...(prev.rubrics || []), { id: `crit-${Date.now()}`, label: "New Criterion", weight: 10 }]
    }));
  };

  const removeCriterionInput = (id) => {
    setCustomVal(prev => ({
      ...prev,
      rubrics: (prev.rubrics || []).filter(r => r.id !== id)
    }));
  };

  // Styles & Track Elements
  const styles = {
    layoutStyles: (
      <style>{`
        .track-step {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: ${colors.inkMuted};
          padding: 8px 12px;
          border-radius: 8px;
        }
        .track-active {
          color: ${colors.accentDeep};
          background: ${colors.accentBg};
        }
        .track-completed {
          color: ${colors.success};
          background: ${colors.successBg};
        }
        .setup-card {
          background: #fff;
          border: 1.5px solid ${colors.borderSoft};
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(15,23,42,0.02);
          transition: all 0.3s ease;
        }
        .suggest-box {
          background: ${colors.pageBg};
          border: 1px solid ${colors.borderSoft};
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .action-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none !important;
        }
        .btn-primary {
          background: ${colors.navy};
          color: #fff;
          border: none;
        }
        .btn-primary:hover:not(:disabled) {
          background: ${colors.navySoft};
          transform: translateY(-1px);
        }
        .btn-secondary {
          background: #fff;
          color: ${colors.inkSoft};
          border: 1.5px solid ${colors.border};
        }
        .btn-secondary:hover:not(:disabled) {
          background: ${colors.pageBg};
          border-color: ${colors.navy};
          color: ${colors.navy};
        }
        .btn-outline {
          background: rgba(59, 130, 246, 0.05);
          color: ${colors.accent};
          border: 1.5px solid rgba(59, 130, 246, 0.15);
        }
        .btn-outline:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.1);
        }
        .inline-custom-panel {
          border-top: 1.5px dashed ${colors.borderSoft};
          padding-top: 24px;
          margin-top: 24px;
          animation: slideDown 0.25s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .apex-loader {
          width: 24px;
          height: 24px;
          border: 3px solid ${colors.accentBg};
          border-top-color: ${colors.accent};
          border-radius: 50%;
          animation: spin 0.8s infinite linear;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .pulse-bar {
          height: 14px;
          background: ${colors.borderSoft};
          border-radius: 4px;
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    )
  };

  // Guards for safety rendering
  if (eventsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '12px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Loading workspace...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 1. Gorgeous, layout-stable Skeleton Loader while initial DB check completes
  if (isInitialLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        {styles.layoutStyles}
        
        {/* Skeletal Spanning Header */}
        <div style={{
          background: colors.navy, borderRadius: '24px', padding: '28px 36px', height: '110px',
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center'
        }}>
          <div className="pulse-bar" style={{ width: '160px', background: 'rgba(255,255,255,0.15)', height: '12px' }} />
          <div className="pulse-bar" style={{ width: '320px', background: 'rgba(255,255,255,0.25)', height: '22px' }} />
        </div>

        {/* Two Column Workspace Grid Layout Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.40fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Column: Glowing setup-card skeleton */}
          <div className="setup-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="pulse-bar" style={{ width: '120px', height: '14px' }} />
              <div className="pulse-bar" style={{ width: '60px', height: '12px' }} />
            </div>
            <div className="pulse-bar" style={{ width: '280px', height: '24px', marginTop: '10px' }} />
            <div className="pulse-bar" style={{ width: '90%', height: '14px' }} />
            
            <div style={{ background: colors.pageBg, borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: `1px solid ${colors.borderSoft}`, marginTop: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div className="pulse-bar" style={{ width: '80px', height: '10px', marginBottom: '8px' }} />
                  <div className="pulse-bar" style={{ width: '120px', height: '16px' }} />
                </div>
                <div>
                  <div className="pulse-bar" style={{ width: '80px', height: '10px', marginBottom: '8px' }} />
                  <div className="pulse-bar" style={{ width: '120px', height: '16px' }} />
                </div>
              </div>
              <div style={{ borderTop: `1.5px solid ${colors.borderSoft}`, paddingTop: '16px' }}>
                <div className="pulse-bar" style={{ width: '100px', height: '10px', marginBottom: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="pulse-bar" style={{ width: '60%', height: '12px' }} />
                  <div className="pulse-bar" style={{ width: '75%', height: '12px' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <div className="pulse-bar" style={{ flex: 1.5, height: '44px', borderRadius: '12px' }} />
              <div className="pulse-bar" style={{ flex: 1, height: '44px', borderRadius: '12px' }} />
            </div>
          </div>

          {/* Right Column: Visualizer Sidebar Skeleton */}
          <div style={{
            background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '24px',
            padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '380px'
          }}>
            <div className="pulse-bar" style={{ width: '160px', height: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} style={{ padding: '16px', borderRadius: '16px', background: colors.pageBg, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="pulse-bar" style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="pulse-bar" style={{ width: '80px', height: '8px', marginBottom: '6px' }} />
                    <div className="pulse-bar" style={{ width: '120px', height: '12px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>event_busy</span>
        <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No events yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {styles.layoutStyles}

      {/* ── Event Context Banner (Top Spanning Header) ── */}
      <div style={{
        background: colors.navy, borderRadius: '24px', padding: '28px 36px', color: '#fff',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)', position: 'relative', overflow: 'hidden',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
      }}>
        {/* Ambient Gradient Background Blur */}
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        
        <div style={{ flex: '1 1 500px', minWidth: '280px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '100px' }}>
              Active Event setup
            </span>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: colors.accent, background: 'rgba(59, 130, 246, 0.16)', padding: '4px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '10px' }}>auto_awesome</span>
              AI Guided Console
            </span>
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {selectedEvent.name}
          </h2>
          <p style={{ fontSize: '13.5px', opacity: 0.7, lineHeight: 1.4, margin: 0 }}>
            {selectedEvent.description || "Set up active competition rubrics, scoring combining calculations, and custom jury permissions."}
          </p>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.03)', padding: '14px 24px', borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '28px', 
          position: 'relative', zIndex: 1 
        }}>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '2px' }}>Event Category</span>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedEvent.type || "Arts & Culture"}</span>
          </div>
          <div style={{ borderLeft: '1.5px solid rgba(255,255,255,0.1)', paddingLeft: '28px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '2px' }}>Strategy Mode</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: colors.accent }}>{selectedEvent.status || "Upcoming"}</span>
          </div>
        </div>
      </div>

      {/* ── Two Column Workspace (Below Spanning Header) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.40fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Wizard Setup & Active Rubric Configuration (Visual Focus Focal Point!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Step Progression Track (Visible only if NOT viewing active saved rubric dashboard and steps 1 to 5) */}
          {!hasActiveRubricScreen && setupStep >= 1 && setupStep <= 5 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.borderSoft}`,
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 1, label: 'Format' },
                { id: 2, label: 'Judges' },
                { id: 3, label: 'Method' },
                { id: 4, label: 'Scale' },
                { id: 5, label: 'Criteria' }
              ].map(st => {
                const isActive = setupStep === st.id;
                const isCompleted = setupStep > st.id;
                return (
                  <div key={st.id} className={`track-step ${isActive ? 'track-active' : ''} ${isCompleted ? 'track-completed' : ''}`}>
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>
                      {isCompleted ? 'check_circle' : 'radio_button_checked'}
                    </span>
                    {st.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Wizard Main Action Card */}
          <div className="setup-card" style={{ position: 'relative', overflow: 'hidden' }}>
            
            {/* 🔒 Locked Frosted Glass Overlay Screen with Elegant Opacity */}
            {isLocked && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(6px)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                textAlign: 'center',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <div style={{
                  background: '#fff',
                  border: `1.5px solid ${colors.borderSoft}`,
                  borderRadius: '24px',
                  padding: '36px 28px',
                  maxWidth: '400px',
                  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '18px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#FFF9E6',
                    color: '#D97706',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.15)'
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>lock</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: colors.navy, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                      Rubric Configuration Locked
                    </h3>
                    <p style={{ fontSize: '13.5px', color: colors.inkSoft, lineHeight: 1.5, margin: 0 }}>
                      This event has officially commenced or is active. Rubric parameters are locked to maintain evaluation validity and tournament scoring integrity.
                    </p>
                  </div>
                  <div style={{ 
                    fontSize: '11px', fontWeight: 800, color: colors.inkMuted, 
                    textTransform: 'uppercase', letterSpacing: '0.05em', 
                    background: colors.pageBg, padding: '6px 14px', borderRadius: '100px',
                    border: `1px solid ${colors.borderSoft}`
                  }}>
                    Start Date: {selectedEvent.startDate ? new Date(selectedEvent.startDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                  </div>
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {(valWarning || (isCustomizing && validationError)) && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C',
                padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
                animation: 'slideDown 0.2s ease-out'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>error</span>
                {valWarning || validationError}
              </div>
            )}
            
            {/* ── Active Saved Rubric Screen (Shows if config exists and was not edited yet) ── */}
            {existingRubric && hasActiveRubricScreen ? (
              <div style={{ animation: 'slideDown 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-rounded" style={{ color: colors.success }}>verified</span>
                    <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.success }}>Active Rubric Configuration</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted }}>Live</span>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 800, color: colors.navy, margin: '0 0 8px' }}>
                  This event is already configured
                </h2>
                <p style={{ fontSize: '14px', color: colors.inkSoft, marginBottom: '24px' }}>
                  The active rubric configuration below is live and currently governing judges' scoresheets.
                </p>

                <div style={{ background: colors.pageBg, borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid ${colors.borderSoft}`, marginBottom: '28px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: `1.5px solid ${colors.borderSoft}`, paddingBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Participation</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>
                        {(config.format || "").toUpperCase()} {config.format !== 'solo' ? `(Team Size Max: ${config.maxMembers})` : ''}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Participant Limit</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>
                        {config.maxParticipants ? `${config.maxParticipants} ${config.format === 'group' ? 'Teams' : 'Participants'}` : 'Unlimited'}
                      </span>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Judge Panel</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>{config.judges} Evaluators</span>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>combining method</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>
                        {config.scoringMethod === 'drop' ? 'Drop extreme outliers' : (config.scoringMethod || "").toUpperCase()}
                      </span>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>scoring scale</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>Scale {config.scale?.min ?? 1}-{config.scale?.max ?? 10}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Criteria breakdown</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {config.rubrics && config.rubrics.map((r, idx) => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700, color: colors.navy }}>
                          <span>{idx + 1}. {r.label}</span>
                          <span style={{ color: colors.accent }}>{r.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setHasActiveRubricScreen(false);
                      setSetupStep(6); // Jump straight to full visual summary step so they can edit easily
                    }}
                    className="action-btn btn-primary"
                    style={{ flex: 1.5 }}
                  >
                    <span className="material-symbols-rounded">edit</span>
                    Edit Specifications
                  </button>
                  <button
                    onClick={() => {
                      setHasActiveRubricScreen(false);
                      setSetupStep(1);
                      triggerStepSuggestion(1); // Re-run assistant sequence
                    }}
                    className="action-btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <span className="material-symbols-rounded">sync</span>
                    Re-Configure
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ── Step 0: Event Identity Confirmation ── */}
                {setupStep === 0 && (
                  <div style={{ animation: 'slideDown 0.3s ease' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: colors.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '24px', color: colors.accent }}>auto_awesome</span>
                    </div>
                    
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: colors.navy, margin: '0 0 16px', lineHeight: 1.3 }}>
                      Is this setup rubric configuration for the selected event ready to be defined?
                    </h2>

                    <div style={{ background: colors.pageBg, borderRadius: '16px', padding: '20px', marginBottom: '28px', border: `1px solid ${colors.borderSoft}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '18px' }}>analytics</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Setup Classify Assessment</span>
                      </div>
                      <p style={{ fontSize: '14px', color: colors.navy, fontWeight: 700, margin: '0 0 4px' }}>
                        Target: {selectedEvent.name}
                      </p>
                      <p style={{ fontSize: '13.5px', color: colors.inkSoft, margin: 0, lineHeight: 1.5 }}>
                        The Setup Assistant will suggest optimized judges counts, score combining methods, ranges, and weight-balanced rubrics directly.
                      </p>
                    </div>

                    <button
                      onClick={() => { setSetupStep(1); triggerStepSuggestion(1); }}
                      className="action-btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      <span className="material-symbols-rounded">rocket_launch</span>
                      Yes, Start Setup Assistant
                    </button>
                  </div>
                )}

                {/* ── Step 1 to 5: Setup Options Workspace ── */}
                {setupStep >= 1 && setupStep <= 5 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.accent }}>
                        Configuring Setting {setupStep} of 5
                      </h3>
                    </div>

                    {/* Suggestions Panel */}
                    <div className="suggest-box" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center' }}>
                      {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="apex-loader" />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: colors.navy }}>
                              AI Assistant is analyzing context and formulating proposal...
                            </span>
                          </div>
                          <div className="pulse-bar" style={{ width: '90%' }} />
                          <div className="pulse-bar" style={{ width: '65%' }} />
                        </div>
                      ) : (
                        <>
                          {setupStep === 1 && suggestion && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: colors.inkMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Suggested Participation Type</div>
                              <div style={{ fontSize: '24px', fontWeight: 900, color: colors.navy, marginBottom: '10px' }}>
                                {(suggestion.format || "").toUpperCase() === "TEAM" ? "GROUP" : (suggestion.format || "").toUpperCase()} 
                                {(suggestion.format || "").toLowerCase() !== 'solo' ? ` (Max members: ${Math.max(2, suggestion.maxMembers || 5)})` : ''}
                              </div>
                              <p style={{ fontSize: '13.5px', color: colors.inkSoft, margin: 0, lineHeight: 1.4 }}>
                                {suggestion.reason}
                              </p>
                            </div>
                          )}

                          {setupStep === 2 && suggestion && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: colors.inkMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Suggested Panel Credentials</div>
                              <div style={{ fontSize: '24px', fontWeight: 900, color: colors.navy, marginBottom: '10px' }}>
                                {Math.max(1, suggestion.judges || 3)} Evaluators
                              </div>
                              <p style={{ fontSize: '13.5px', color: colors.inkSoft, margin: 0, lineHeight: 1.4 }}>
                                {suggestion.reason}
                              </p>
                            </div>
                          )}

                          {setupStep === 3 && suggestion && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: colors.inkMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Suggested Score Combining Method</div>
                              <div style={{ fontSize: '22px', fontWeight: 900, color: colors.navy, marginBottom: '10px' }}>
                                {suggestion.scoringMethod === 'drop' ? 'Drop extreme outliers then average' : (suggestion.scoringMethod || "").toUpperCase()}
                              </div>
                              <p style={{ fontSize: '13.5px', color: colors.inkSoft, margin: 0, lineHeight: 1.4 }}>
                                {suggestion.reason}
                              </p>
                            </div>
                          )}

                          {setupStep === 4 && suggestion && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: colors.inkMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Suggested Scoring Scale</div>
                              <div style={{ fontSize: '24px', fontWeight: 900, color: colors.navy, marginBottom: '10px' }}>
                                Scale: {Math.max(0, suggestion.scale?.min ?? 1)} to {Math.max(1, suggestion.scale?.max ?? 10)}
                              </div>
                              <p style={{ fontSize: '13.5px', color: colors.inkSoft, margin: 0, lineHeight: 1.4 }}>
                                {suggestion.reason}
                              </p>
                            </div>
                          )}

                          {setupStep === 5 && suggestion && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: colors.inkMuted, marginBottom: '12px', textTransform: 'uppercase' }}>Suggested Rubric Weight Breakdown</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                {suggestion.rubrics && suggestion.rubrics.map((r, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: colors.navy }}>
                                    <span>{idx + 1}. {r.label}</span>
                                    <span style={{ color: colors.accent }}>{Math.max(1, r.weight)}%</span>
                                  </div>
                                ))}
                              </div>
                              <p style={{ fontSize: '13px', color: colors.inkSoft, margin: '0 0 16px', lineHeight: 1.4, borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '10px' }}>
                                Reason: {suggestion.reason || "Structured weight ratios provide cohesive performance scoring."}
                              </p>

                              {/* ✨ AI Prompt Chatbar in the main configure part */}
                              <div style={{ 
                                marginTop: '12px', 
                                borderTop: `1.5px dashed ${colors.borderSoft}`, 
                                paddingTop: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>auto_awesome</span>
                                  <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: colors.navy }}>
                                    Customize this Rubric via AI Prompt
                                  </span>
                                </div>

                                <form onSubmit={handlePromptSubmit} style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                                  <input
                                    type="text"
                                    disabled={isLocked || isPromptLoading}
                                    value={promptText}
                                    onChange={e => setPromptText(e.target.value)}
                                    placeholder={isLocked ? "Rubric editing is locked" : "Describe weights (e.g., 'Make it 4 criteria prioritizing code quality...')" }
                                    style={{
                                      flex: 1,
                                      padding: '10px 14px',
                                      paddingRight: '42px', // leave room for submit icon
                                      borderRadius: '12px',
                                      border: `1.5px solid ${colors.border}`,
                                      background: '#fff',
                                      fontSize: '12px',
                                      outline: 'none',
                                      transition: 'all 0.2s',
                                      fontFamily: 'inherit',
                                    }}
                                  />
                                  
                                  <button
                                    type="submit"
                                    disabled={isLocked || isPromptLoading || !promptText.trim()}
                                    style={{
                                      position: 'absolute',
                                      right: '6px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '8px',
                                      background: promptText.trim() ? colors.navy : colors.borderSoft,
                                      color: promptText.trim() ? '#fff' : colors.inkMuted,
                                      border: 'none',
                                      cursor: promptText.trim() ? 'pointer' : 'not-allowed',
                                      display: 'grid',
                                      placeItems: 'center',
                                      transition: 'all 0.2s',
                                    }}
                                  >
                                    {isPromptLoading ? (
                                      <div style={{
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid transparent',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite'
                                      }} />
                                    ) : (
                                      <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>auto_awesome</span>
                                    )}
                                  </button>
                                </form>

                                {isPromptLoading && (
                                  <div style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: colors.accent,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    animation: 'pulse 1.5s infinite ease-in-out',
                                    paddingLeft: '4px'
                                  }}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                                    Designing your customized rubric weights...
                                  </div>
                                )}

                                {!isLocked && !isPromptLoading && (
                                  <span style={{ fontSize: '9.5px', color: colors.inkMuted, paddingLeft: '4px', lineHeight: 1.3 }}>
                                    Describe the criteria and weights you want, and AI will automatically build the rubric suggestions.
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Main Setup Controls */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {setupStep > 1 && (
                        <button onClick={handleBack} disabled={loading} className="action-btn btn-secondary" style={{ padding: '12px 18px' }}>
                          <span className="material-symbols-rounded">arrow_back</span>
                          Back
                        </button>
                      )}
                      <button onClick={handleAccept} disabled={loading} className="action-btn btn-primary" style={{ flex: 1.5 }}>
                        <span className="material-symbols-rounded">check</span>
                        Accept Recommendation
                      </button>
                      <button onClick={() => setIsCustomizing(!isCustomizing)} disabled={loading} className="action-btn btn-secondary" style={{ flex: 1 }}>
                        <span className="material-symbols-rounded">edit</span>
                        Customize
                      </button>
                      <button onClick={handleRegenerate} disabled={loading} className="action-btn btn-outline" style={{ width: '48px', height: '48px', padding: 0 }}>
                        <span className="material-symbols-rounded">sync</span>
                      </button>
                    </div>

                    {/* Inline Customization Section */}
                    {isCustomizing && (
                      <div className="inline-custom-panel">
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: colors.navy, margin: '0 0 16px' }}>Customize values directly:</h4>
                        
                        {/* Step 1 custom form */}
                        {setupStep === 1 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              {['solo', 'group'].map(f => (
                                <button
                                  key={f}
                                  onClick={() => {
                                    setCustomVal(prev => ({
                                      ...prev,
                                      format: f,
                                      maxMembers: f === 'solo' ? 1 : Math.max(2, prev.maxMembers || 2)
                                    }));
                                  }}
                                  style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                    border: `1.5px solid ${customVal.format === f ? colors.navy : colors.border}`,
                                    background: customVal.format === f ? colors.navy : '#fff',
                                    color: customVal.format === f ? '#fff' : colors.inkSoft
                                  }}
                                >
                                  {f.toUpperCase()}
                                </button>
                              ))}
                            </div>
                            {customVal.format === 'group' && (
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, display: 'block', marginBottom: '6px' }}>MAX TEAM MEMBERS (MINIMUM 2)</label>
                                <input
                                  type="number"
                                  min="2"
                                  value={customVal.maxMembers || 2}
                                  onChange={e => {
                                    const v = Number(e.target.value);
                                    setCustomVal(prev => ({ ...prev, maxMembers: v }));
                                  }}
                                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1.5px solid ${colors.border}`, boxSizing: 'border-box' }}
                                />
                              </div>
                            )}
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, display: 'block', marginBottom: '6px' }}>
                                MAXIMUM {customVal.format === 'group' ? 'TEAMS' : 'PARTICIPANTS'} (MINIMUM 1)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={customVal.maxParticipants || 50}
                                onChange={e => {
                                  const v = Number(e.target.value);
                                  setCustomVal(prev => ({ ...prev, maxParticipants: v }));
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1.5px solid ${colors.border}`, boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Step 2 custom form */}
                        {setupStep === 2 && (
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, display: 'block', marginBottom: '6px' }}>JUDGE COUNT (MINIMUM 1)</label>
                            <input
                              type="number"
                              min="1"
                              value={customVal.judges || 3}
                              onChange={e => {
                                const v = Number(e.target.value);
                                setCustomVal(prev => ({ ...prev, judges: v }));
                              }}
                              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1.5px solid ${colors.border}`, boxSizing: 'border-box' }}
                            />
                          </div>
                        )}

                        {/* Step 3 custom form */}
                        {setupStep === 3 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                              { id: 'average', label: "Average Scoring" },
                              { id: 'sum', label: "Sum Total" },
                              { id: 'drop', label: "Drop extreme outliers then average" }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setCustomVal(prev => ({ ...prev, scoringMethod: opt.id }))}
                                style={{
                                  padding: '12px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                                  border: `1.5px solid ${customVal.scoringMethod === opt.id ? colors.navy : colors.borderSoft}`,
                                  background: customVal.scoringMethod === opt.id ? colors.navy : '#fff',
                                  color: customVal.scoringMethod === opt.id ? '#fff' : colors.inkSoft
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Step 4 custom form */}
                        {setupStep === 4 && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, display: 'block', marginBottom: '6px' }}>MIN RANGE (MINIMUM 0)</label>
                              <input
                                type="number"
                                min="0"
                                value={customVal.scaleMin ?? 1}
                                onChange={e => {
                                  const v = Number(e.target.value);
                                  setCustomVal(prev => ({ ...prev, scaleMin: v }));
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1.5px solid ${colors.border}`, boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, display: 'block', marginBottom: '6px' }}>MAX RANGE</label>
                              <input
                                type="number"
                                value={customVal.scaleMax ?? 10}
                                onChange={e => {
                                  const v = Number(e.target.value);
                                  setCustomVal(prev => ({ ...prev, scaleMax: v }));
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1.5px solid ${colors.border}`, boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Step 5 custom form */}
                        {setupStep === 5 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {customVal.rubrics && customVal.rubrics.map((r, idx) => (
                              <div key={r.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={r.label}
                                  onChange={e => {
                                    const list = [...customVal.rubrics];
                                    list[idx].label = e.target.value;
                                    setCustomVal(prev => ({ ...prev, rubrics: list }));
                                  }}
                                  style={{ flex: 3, padding: '8px 12px', borderRadius: '8px', border: `1.5px solid ${colors.border}`, fontSize: '13px' }}
                                  placeholder="Criteria label"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  value={r.weight}
                                  onChange={e => {
                                    const list = [...customVal.rubrics];
                                    list[idx].weight = e.target.value; // Store as raw input so user can edit freely
                                    setCustomVal(prev => ({ ...prev, rubrics: list }));
                                  }}
                                  onBlur={e => {
                                    const list = [...customVal.rubrics];
                                    // Clamp to at least 1% on blur to prevent 0 or empty inputs
                                    list[idx].weight = Math.max(1, Number(e.target.value) || 1);
                                    setCustomVal(prev => ({ ...prev, rubrics: list }));
                                  }}
                                  style={{ flex: 1.2, padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${colors.border}`, textAlign: 'right', fontSize: '13px' }}
                                  placeholder="Weight %"
                                />
                                <button
                                  onClick={() => removeCriterionInput(r.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.error }}
                                >
                                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                </button>
                              </div>
                            ))}
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                              <button
                                onClick={addCriterionInput}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer', color: colors.accent,
                                  fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span> Add Criteria
                              </button>
                              
                              <span style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted }}>
                                Total Weight: {customVal.rubrics ? customVal.rubrics.reduce((s, r) => s + (Number(r.weight) || 0), 0) : 0}%
                              </span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleApplyCustomValue}
                          disabled={isConfirmDisabled}
                          className="action-btn btn-primary"
                          style={{ width: '100%', marginTop: '20px' }}
                        >
                          Confirm & Apply Custom Settings
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Step 6: Full Summary Review ── */}
                {setupStep === 6 && (
                  <div style={{ animation: 'slideDown 0.3s ease' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: colors.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '24px', color: colors.success }}>check_circle</span>
                    </div>
                    
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: colors.navy, margin: '0 0 8px' }}>
                      Does everything look correct? Say confirm or tell me what to change.
                    </h2>
                    <p style={{ fontSize: '14px', color: colors.inkSoft, marginBottom: '24px' }}>
                      Review your event specifications. Once saved, these configurations will govern real-time judge scoring.
                    </p>

                    <div style={{ background: colors.pageBg, borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid ${colors.borderSoft}`, marginBottom: '28px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: `1.5px solid ${colors.borderSoft}`, paddingBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Participation</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>
                            {(config.format || "").toUpperCase()} {config.format !== 'solo' ? `(Team Size Max: ${config.maxMembers})` : ''}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Participant Limit</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>
                            {config.maxParticipants ? `${config.maxParticipants} ${config.format === 'group' ? 'Teams' : 'Participants'}` : 'Unlimited'}
                          </span>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Judge Panel</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>{config.judges} Evaluators</span>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>combining method</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>
                            {config.scoringMethod === 'drop' ? 'Drop extreme outliers' : (config.scoringMethod || "").toUpperCase()}
                          </span>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>scoring scale</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: colors.navy }}>Scale {config.scale?.min ?? 1}-{config.scale?.max ?? 10}</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Criteria breakdown</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {config.rubrics && config.rubrics.map((r, idx) => (
                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700, color: colors.navy }}>
                              <span>{idx + 1}. {r.label}</span>
                              <span style={{ color: colors.accent }}>{r.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={handleBack} disabled={isSaving} className="action-btn btn-secondary" style={{ padding: '12px 18px' }}>
                        <span className="material-symbols-rounded">arrow_back</span>
                        Back
                      </button>
                      
                      <button
                        onClick={handleFinalConfirm}
                        disabled={isSaving}
                        className="action-btn btn-primary"
                        style={{ flex: 2, background: colors.success }}
                      >
                        <span className="material-symbols-rounded">check</span>
                        {isSaving ? "Publishing Setup..." : "Confirm & Save"}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSetupStep(1);
                          triggerStepSuggestion(1);
                        }}
                        disabled={isSaving}
                        className="action-btn btn-secondary"
                        style={{ flex: 1.2 }}
                      >
                        Reset Form
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Step 7: Completed Celebration and JSON Block Output ── */}
                {setupStep === 7 && (
                  <div style={{ animation: 'slideDown 0.3s ease' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: colors.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '24px', color: colors.success }}>verified</span>
                    </div>
                    
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: colors.navy, margin: '0 0 8px' }}>
                      Setup Finalized!
                    </h2>
                    <p style={{ fontSize: '14px', color: colors.inkSoft, marginBottom: '20px' }}>
                      Your scoring parameters and guidelines have been stored in the database. 
                      Below is the dynamic configuration JSON generated for this event:
                    </p>

                    <pre style={{
                      background: colors.navySoft, color: '#fff', padding: '20px', borderRadius: '14px',
                      overflowX: 'auto', fontSize: '13px', fontFamily: "'Fira Code', monospace", marginBottom: '28px'
                    }}>
                      <code>{finalJSONText}</code>
                    </pre>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setHasActiveRubricScreen(true)}
                        className="action-btn btn-primary"
                        style={{ flex: 1.5 }}
                      >
                        View Live Rubric
                      </button>
                      <button
                        onClick={() => {
                          setHasActiveRubricScreen(false);
                          setSetupStep(1);
                          triggerStepSuggestion(1);
                        }}
                        className="action-btn btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Re-Configure
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

        {/* Right Column: Live Setup Visualizer Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '24px',
            padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: colors.navy, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-rounded" style={{ color: colors.accent }}>dashboard</span>
              Live Setup Visualizer
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Visualizer Item 1: Format */}
              <div style={{
                padding: '16px', borderRadius: '16px', background: colors.pageBg,
                border: `1.5px solid ${setupStep === 1 ? colors.navy : 'transparent'}`,
                transition: 'all 0.3s', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: (existingRubric && hasActiveRubricScreen) || setupStep > 1 ? colors.successBg : '#fff', color: (existingRubric && hasActiveRubricScreen) || setupStep > 1 ? colors.success : colors.inkMuted, display: 'grid', placeItems: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>widgets</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: colors.inkMuted, display: 'block' }}>Participation</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: colors.navy }}>
                      {(existingRubric && hasActiveRubricScreen) || setupStep > 1 ? (config.format || "").toUpperCase() : "Pending..."}
                    </span>
                  </div>
                </div>
                {((existingRubric && hasActiveRubricScreen) || setupStep > 1) && (config.format || "").toLowerCase() !== 'solo' && (
                  <span style={{ fontSize: '11px', fontWeight: 800, color: colors.accent, background: colors.accentBg, padding: '4px 10px', borderRadius: '6px' }}>
                    Max: {config.maxMembers}
                  </span>
                )}
              </div>

              {/* Visualizer Item 2: Judges */}
              <div style={{
                padding: '16px', borderRadius: '16px', background: colors.pageBg,
                border: `1.5px solid ${setupStep === 2 ? colors.navy : 'transparent'}`,
                transition: 'all 0.3s', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: (existingRubric && hasActiveRubricScreen) || setupStep > 2 ? colors.successBg : '#fff', color: (existingRubric && hasActiveRubricScreen) || setupStep > 2 ? colors.success : colors.inkMuted, display: 'grid', placeItems: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>gavel</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: colors.inkMuted, display: 'block' }}>Judge Panel</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: colors.navy }}>
                      {(existingRubric && hasActiveRubricScreen) || setupStep > 2 ? `${config.judges} Evaluators` : "Pending..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visualizer Item 3: Combine Method */}
              <div style={{
                padding: '16px', borderRadius: '16px', background: colors.pageBg,
                border: `1.5px solid ${setupStep === 3 ? colors.navy : 'transparent'}`,
                transition: 'all 0.3s', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: (existingRubric && hasActiveRubricScreen) || setupStep > 3 ? colors.successBg : '#fff', color: (existingRubric && hasActiveRubricScreen) || setupStep > 3 ? colors.success : colors.inkMuted, display: 'grid', placeItems: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>calculate</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: colors.inkMuted, display: 'block' }}>Combining Method</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: colors.navy }}>
                      {(existingRubric && hasActiveRubricScreen) || setupStep > 3 ? (config.scoringMethod === 'drop' ? 'Drop extreme averages' : (config.scoringMethod || "").toUpperCase()) : "Pending..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visualizer Item 4: Scale */}
              <div style={{
                padding: '16px', borderRadius: '16px', background: colors.pageBg,
                border: `1.5px solid ${setupStep === 4 ? colors.navy : 'transparent'}`,
                transition: 'all 0.3s', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: (existingRubric && hasActiveRubricScreen) || setupStep > 4 ? colors.successBg : '#fff', color: (existingRubric && hasActiveRubricScreen) || setupStep > 4 ? colors.success : colors.inkMuted, display: 'grid', placeItems: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>linear_scale</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: colors.inkMuted, display: 'block' }}>Scoring Range</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: colors.navy }}>
                      {(existingRubric && hasActiveRubricScreen) || setupStep > 4 ? `Scale: ${config.scale?.min ?? 1} to ${config.scale?.max ?? 10}` : "Pending..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visualizer Item 5: Criteria weights progress indicator list */}
              <div style={{
                padding: '16px', borderRadius: '16px', background: colors.pageBg,
                border: `1.5px solid ${setupStep === 5 ? colors.navy : 'transparent'}`,
                transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: (existingRubric && hasActiveRubricScreen) || setupStep > 5 ? colors.successBg : '#fff', color: (existingRubric && hasActiveRubricScreen) || setupStep > 5 ? colors.success : colors.inkMuted, display: 'grid', placeItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>rule</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: colors.inkMuted, display: 'block' }}>Rubric Specifications</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: colors.navy }}>
                        {(existingRubric && hasActiveRubricScreen) || setupStep > 5 ? `${config.rubrics?.length ?? 0} Criteria Weights Set` : "Pending..."}
                      </span>
                    </div>
                  </div>
                </div>

                {((existingRubric && hasActiveRubricScreen) || setupStep > 5) && config.rubrics && config.rubrics.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px', borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '10px' }}>
                    {config.rubrics.map(rub => (
                      <div key={rub.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: colors.inkSoft, marginBottom: '4px' }}>
                          <span>{rub.label}</span>
                          <span>{rub.weight}%</span>
                        </div>
                        <div style={{ height: '4px', background: '#fff', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${rub.weight}%`, background: colors.accent, borderRadius: '100px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
