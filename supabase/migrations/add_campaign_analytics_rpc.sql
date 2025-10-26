
CREATE OR REPLACE FUNCTION get_campaign_performance_stats()
RETURNS TABLE (
    campaign_id BIGINT,
    campaign_name TEXT,
    total_participants BIGINT,
    total_points_awarded BIGINT,
    engagement_rate NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS campaign_id,
        c.name AS campaign_name,
        COUNT(DISTINCT a.user_id) AS total_participants,
        SUM(a.points_earned) AS total_points_awarded,
        (COUNT(DISTINCT a.user_id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM profiles WHERE role = 'customer'), 0)) * 100 AS engagement_rate
    FROM 
        campaigns c
    LEFT JOIN 
        activities a ON c.id = a.campaign_id
    GROUP BY 
        c.id, c.name;
END; 
$$ LANGUAGE plpgsql;
