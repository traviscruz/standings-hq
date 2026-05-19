-- 1. Create Profiles table (linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create OTP Codes table for custom verification
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Setup Row Level Security (RLS) for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Setup RLS for OTP Codes (Should generally be hidden from public)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
-- No public policies needed as the Node.js backend uses service_role key to manage these.

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Events Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Core Identity
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,                    -- e.g. 'Sports', 'Performing Arts', 'Other'
  description   TEXT,

  -- Schedule
  start_date    DATE NOT NULL,
  start_time    TIME,
  end_date      DATE NOT NULL,
  end_time      TIME,

  -- Venue
  location      TEXT,                             -- human-readable address
  latitude      NUMERIC(10, 7),
  longitude     NUMERIC(10, 7),

  -- Access & Status
  visibility    TEXT NOT NULL DEFAULT 'Public'    CHECK (visibility IN ('Public', 'Private')),
  status        TEXT NOT NULL DEFAULT 'upcoming'  CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),

  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Setup RLS for Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view public events
CREATE POLICY "Public events are viewable by all"
ON public.events FOR SELECT
USING (visibility = 'Public');

-- Organizers can view their own private events
CREATE POLICY "Organizers can view own events"
ON public.events FOR SELECT
USING (auth.uid() = organizer_id);

-- Organizers can insert their own events
CREATE POLICY "Organizers can create events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events"
ON public.events FOR UPDATE
USING (auth.uid() = organizer_id);

-- Organizers can delete their own events
CREATE POLICY "Organizers can delete own events"
ON public.events FOR DELETE
USING (auth.uid() = organizer_id);

-- 7. Auto-update updated_at on events
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Subscriptions Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Plan Info
  plan_name     TEXT NOT NULL,                    -- 'Monthly', 'Yearly'
  amount        NUMERIC(10, 2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'PHP',
  
  -- Lifecycle
  status        TEXT NOT NULL DEFAULT 'active'    CHECK (status IN ('active', 'expired', 'cancelled', 'past_due')),
  start_date    TIMESTAMPTZ DEFAULT NOW(),
  end_date      TIMESTAMPTZ NOT NULL,
  
  -- Paymongo Integration
  paymongo_id   TEXT,                             -- e.g. Payment Link ID or Subscription ID
  
  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Setup RLS for Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Event Rubrics Table (AI Generated)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_rubrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  
  -- The full JSON configuration from AI
  config        JSONB NOT NULL,
  
  -- Status: draft | published
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  
  -- Identity
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Setup RLS for Event Rubrics
ALTER TABLE public.event_rubrics ENABLE ROW LEVEL SECURITY;

-- Organizers can manage their own event's rubric
CREATE POLICY "Organizers can manage own rubrics"
ON public.event_rubrics FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.event_rubrics.event_id 
    AND public.events.organizer_id = auth.uid()
  )
);

-- Judges can view published rubrics
CREATE POLICY "Judges can view published rubrics"
ON public.event_rubrics FOR SELECT
USING (
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.event_rubrics.event_id
  )
);

-- Trigger for updated_at
CREATE TRIGGER set_event_rubrics_updated_at
BEFORE UPDATE ON public.event_rubrics
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Event Participants Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE,
  
  name          TEXT NOT NULL,
  email         TEXT,
  team          TEXT,
  score         NUMERIC,
  status        TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Registered')),
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Setup RLS for Event Participants
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Organizers can manage their own event's participants
CREATE POLICY "Organizers can manage own participants"
ON public.event_participants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.event_participants.event_id 
    AND public.events.organizer_id = auth.uid()
  )
);

-- Public can view participants of public events
CREATE POLICY "Public can view participants of public events"
ON public.event_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.event_participants.event_id
    AND public.events.visibility = 'Public'
  )
);

-- Trigger for updated_at
CREATE TRIGGER set_event_participants_updated_at
BEFORE UPDATE ON public.event_participants
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Event Judges Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_judges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE,
  
  name          TEXT NOT NULL,
  email         TEXT,
  expertise     TEXT,
  role          TEXT,
  status        TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined')),
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Setup RLS for Event Judges
ALTER TABLE public.event_judges ENABLE ROW LEVEL SECURITY;

-- Organizers can manage their own event's judges
CREATE POLICY "Organizers can manage own judges"
ON public.event_judges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.event_judges.event_id 
    AND public.events.organizer_id = auth.uid()
  )
);

-- Public can view judges of public events
CREATE POLICY "Public can view judges of public events"
ON public.event_judges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.event_judges.event_id
    AND public.events.visibility = 'Public'
  )
);

-- Trigger for updated_at
CREATE TRIGGER set_event_judges_updated_at
BEFORE UPDATE ON public.event_judges
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. Certificates Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  achievement     TEXT NOT NULL,                           -- e.g. 'Champion', '1st Runner Up', 'Participation'
  custom_text     TEXT,                                    -- Customized certificate text
  template_config JSONB NOT NULL,                          -- Dynamic border template, orient, signatories config
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent multiple certificates for the same event and participant
  CONSTRAINT unique_event_participant_cert UNIQUE (event_id, participant_id)
);

-- Setup RLS for Certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Organizers can manage certificates for their own events
CREATE POLICY "Organizers can manage own certificates"
ON public.certificates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE public.events.id = public.certificates.event_id 
    AND public.events.organizer_id = auth.uid()
  )
);

-- Policy: Participants can view their own certificates (joined by email matching their profile)
CREATE POLICY "Participants can view own certificates"
ON public.certificates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_participants ep
    JOIN public.profiles p ON ep.email = p.email
    WHERE ep.id = public.certificates.participant_id
    AND p.id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER set_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
