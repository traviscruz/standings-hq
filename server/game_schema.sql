-- ─────────────────────────────────────────────────────────────────────────────
-- Traditional Games / Tournament Mode — Schema Extension
-- Run this in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add competition_mode to events table (default = 'standard')
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS competition_mode TEXT NOT NULL DEFAULT 'standard'
  CHECK (competition_mode IN ('standard', 'game'));

-- 2. game_setups — Stores the Claude AI-generated game configuration
CREATE TABLE IF NOT EXISTS public.game_setups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,

  -- Full game configuration JSON from AI + organizer customization
  config        JSONB NOT NULL,
  -- {
  --   gameName: string,
  --   gameType: string (e.g. "Tug of War"),
  --   description: string,
  --   teamCount: number,
  --   teams: [{ id, name, color }],
  --   roundsPerMatch: number (best-of),
  --   bracketFormat: "single_elimination" | "double_elimination" | "round_robin",
  --   advancementRule: string,
  --   scoringFields: [{ id, label, type: "win_loss" | "points" | "time" | "custom" }],
  --   matchStructure: { totalRounds, matchesPerRound }
  -- }

  status        TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for game_setups
ALTER TABLE public.game_setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage game setups"
ON public.game_setups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.game_setups.event_id
    AND public.events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Public can view game setups for public events"
ON public.game_setups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.game_setups.event_id
    AND public.events.visibility = 'Public'
  )
);

CREATE TRIGGER set_game_setups_updated_at
BEFORE UPDATE ON public.game_setups
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. match_brackets — Stores each match in the tournament bracket
CREATE TABLE IF NOT EXISTS public.match_brackets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE,

  round         INT NOT NULL,          -- 1 = first round, 2 = semis, 3 = finals...
  match_order   INT NOT NULL,          -- order within the round (1, 2, 3...)
  round_label   TEXT,                  -- e.g. "Quarterfinals", "Semifinals", "Grand Final"

  team_a        TEXT,                  -- team name
  team_b        TEXT,                  -- team name
  winner        TEXT,                  -- team name of winner (null until decided)

  score_a       JSONB DEFAULT '{}',    -- { "round1": 1, "round2": 0, ... } or { "points": 12 }
  score_b       JSONB DEFAULT '{}',

  match_notes   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ongoing', 'completed')),

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (event_id, round, match_order)
);

-- RLS for match_brackets
ALTER TABLE public.match_brackets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage match brackets"
ON public.match_brackets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.match_brackets.event_id
    AND public.events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Public can view brackets for public events"
ON public.match_brackets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.match_brackets.event_id
    AND public.events.visibility = 'Public'
  )
);

CREATE POLICY "Judges can view brackets for assigned events"
ON public.match_brackets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_judges ej
    JOIN public.events e ON ej.event_id = e.id
    WHERE e.id = public.match_brackets.event_id
    AND ej.status = 'Accepted'
  )
);

CREATE TRIGGER set_match_brackets_updated_at
BEFORE UPDATE ON public.match_brackets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. game_match_scores — Round-by-round scores recorded by judges
CREATE TABLE IF NOT EXISTS public.game_match_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE,
  match_id      UUID REFERENCES public.match_brackets(id) ON DELETE CASCADE,
  judge_id      UUID,                  -- references event_judges.id
  round_num     INT NOT NULL,          -- which round (1, 2, 3) within the match
  team_a_score  NUMERIC,              -- score or 1=win/0=loss
  team_b_score  NUMERIC,
  notes         TEXT,
  submitted     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (match_id, judge_id, round_num)
);

-- RLS for game_match_scores
ALTER TABLE public.game_match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Judges can manage their own game scores"
ON public.game_match_scores FOR ALL
USING (TRUE);  -- Backend uses service_role key

CREATE TRIGGER set_game_match_scores_updated_at
BEFORE UPDATE ON public.game_match_scores
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
