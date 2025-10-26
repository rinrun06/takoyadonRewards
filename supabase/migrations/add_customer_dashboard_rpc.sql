CREATE OR REPLACE FUNCTION get_customer_dashboard_data(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
    loyalty_points INT;
    user_rank TEXT;
    recent_activities JSONB;
    rewards_catalog JSONB;
BEGIN
    -- Get total loyalty points
    SELECT total_points INTO loyalty_points FROM public.users WHERE id = p_user_id;

    -- Determine user rank (example logic)
    IF loyalty_points >= 1000 THEN
        user_rank := 'Gold';
    ELSIF loyalty_points >= 500 THEN
        user_rank := 'Silver';
    ELSE
        user_rank := 'Bronze';
    END IF;

    -- Get recent activities
    SELECT jsonb_agg(t) INTO recent_activities FROM (
        SELECT description, points, created_at
        FROM public.point_transactions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
    ) t;

    -- Get available rewards
    SELECT jsonb_agg(r) INTO rewards_catalog FROM (
        SELECT id, name, points_cost
        FROM public.rewards
        WHERE is_active = true AND points_cost <= loyalty_points
        ORDER BY points_cost ASC
        LIMIT 10
    ) r;

    -- Return all data as a single JSONB object
    RETURN jsonb_build_object(
        'loyalty_points', COALESCE(loyalty_points, 0),
        'rank', user_rank,
        'recent_activities', COALESCE(recent_activities, '[]'::jsonb),
        'rewards_catalog', COALESCE(rewards_catalog, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql;

-- Grant usage to the function
GRANT EXECUTE ON FUNCTION get_customer_dashboard_data(TEXT) TO authenticated;