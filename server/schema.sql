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
