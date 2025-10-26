-- =============================================
-- 1. CREATE TABLES FOR REAL-TIME FEATURES
-- =============================================

-- Table to store customer feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.users(id) ON DELETE CASCADE,
  branch_id VARCHAR(255) REFERENCES public.branches(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to log customer check-ins via QR codes
CREATE TABLE IF NOT EXISTS public.check_ins (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.users(id) ON DELETE CASCADE,
  branch_id VARCHAR(255) REFERENCES public.branches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to manage the lifecycle of a reward redemption
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.users(id) ON DELETE CASCADE,
  reward_name TEXT NOT NULL,
  branch_id VARCHAR(255) REFERENCES public.branches(id) ON DELETE CASCADE,
  points_cost INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table for users to submit activities for points (e.g., social media post)
CREATE TABLE IF NOT EXISTS public.point_earning_activities (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(255) NOT NULL,
  description TEXT,
  attachment_url TEXT,
  points_awarded INTEGER,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Table to power the system-wide notification feature
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.users(id) ON DELETE SET NULL, -- For user-specific notifications
  role VARCHAR(50), -- For role-based notifications (e.g., all_customers)
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- 2. RLS POLICIES FOR NEW TABLES
-- =============================================

-- Feedback Table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit their own feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Admins and staff can view feedback for their branches" ON public.feedback FOR SELECT USING (
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin') OR
    (SELECT branch_id FROM public.staff WHERE user_id = auth.uid()::text) = branch_id
);

-- Check-ins Table
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create their own check-ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own check-ins" ON public.check_ins FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Admins and staff can view check-ins for their branches" ON public.check_ins FOR SELECT USING (
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin') OR
    (SELECT branch_id FROM public.staff WHERE user_id = auth.uid()::text) = branch_id
);

-- Reward Redemptions Table
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create and view their own redemptions" ON public.reward_redemptions FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Admins and staff can manage redemptions for their branches" ON public.reward_redemptions FOR ALL USING (
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin') OR
    (SELECT branch_id FROM public.staff WHERE user_id = auth.uid()::text) = branch_id
) WITH CHECK (
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin') OR
    (SELECT branch_id FROM public.staff WHERE user_id = auth.uid()::text) = branch_id
);

-- Point Earning Activities Table
ALTER TABLE public.point_earning_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create and view their own activities" ON public.point_earning_activities FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Admins can manage all activities" ON public.point_earning_activities FOR ALL USING (
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin')
);

-- Notifications Table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own and role-based notifications" ON public.notifications FOR SELECT USING (
    auth.uid()::text = user_id OR
    (SELECT role from public.users where id = auth.uid()::text) = role
);
CREATE POLICY "Users can mark their own notifications as read" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT WITH CHECK (
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin')
);


-- =============================================
-- 3. ENABLE REALTIME BROADCASTING
-- =============================================

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create a new publication and add all the necessary tables
CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.users, 
    public.feedback, 
    public.check_ins, 
    public.reward_redemptions, 
    public.point_earning_activities, 
    public.notifications;
