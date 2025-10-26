-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_rules ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Allow users to view their own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- FRANCHISES
CREATE POLICY "Allow anon to view franchises" ON public.franchises
FOR SELECT TO anon, authenticated USING (true);

-- BRANCHES
CREATE POLICY "Allow anon to view branches" ON public.branches
FOR SELECT TO anon, authenticated USING (true);

-- REWARDS
CREATE POLICY "Allow anon to view rewards" ON public.rewards
FOR SELECT TO anon, authenticated USING (true);

-- CAMPAIGNS
CREATE POLICY "Allow authenticated users to view campaigns" ON public.campaigns
FOR SELECT TO authenticated USING (true);

-- POINT TRANSACTIONS
CREATE POLICY "Allow users to view their own point transactions" ON public.point_transactions
FOR SELECT USING (auth.uid() = user_id);

-- REWARD REDEMPTIONS
CREATE POLICY "Allow users to view their own reward redemptions" ON public.reward_redemptions
FOR SELECT USING (auth.uid() = user_id);

-- VISITS
CREATE POLICY "Allow users to view their own visits" ON public.visits
FOR SELECT USING (auth.uid() = user_id);

-- FEEDBACK
CREATE POLICY "Allow users to view their own feedback" ON public.feedback
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own feedback" ON public.feedback
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CAMPAIGN APPROVALS
CREATE POLICY "Allow authenticated users to view campaign approvals" ON public.campaign_approvals
FOR SELECT TO authenticated USING (true);

-- CAMPAIGN COMMENTS
CREATE POLICY "Allow authenticated users to view campaign comments" ON public.campaign_comments
FOR SELECT TO authenticated USING (true);

-- POINTS RULES
CREATE POLICY "Allow anon to view points rules" ON public.points_rules
FOR SELECT TO anon, authenticated USING (true);
