-- ==============================================
-- 1. CREATE influencer_applications TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS public.influencer_applications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  social_media_platform VARCHAR(50) NOT NULL,
  social_media_handle VARCHAR(255) NOT NULL,
  followers_count INTEGER NOT NULL,
  content_type TEXT,
  why_influence TEXT NOT NULL,
  portfolio_urls TEXT[],
  document_url TEXT, -- To store the path to the uploaded document
  status VARCHAR(50) DEFAULT 'pending', -- e.g., pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- 2. RLS POLICIES for influencer_applications
-- ==============================================

-- Enable RLS
ALTER TABLE public.influencer_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own application
CREATE POLICY "Allow users to view their own application" 
ON public.influencer_applications FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own application
CREATE POLICY "Allow users to create their own application" 
ON public.influencer_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Allow admins to view all applications" 
ON public.influencer_applications FOR SELECT
USING (
    (SELECT role from public.users where id = auth.uid()) IN ('super_admin', 'franchise_admin')
);

-- Admins can update all applications (e.g., to change status)
CREATE POLICY "Allow admins to update applications" 
ON public.influencer_applications FOR UPDATE
USING (
    (SELECT role from public.users where id = auth.uid()) IN ('super_admin', 'franchise_admin')
);
