
-- Description: This trigger invokes an Edge Function to send an email notification 
-- to all super_admins whenever a new campaign request is inserted.

CREATE OR REPLACE TRIGGER on_new_campaign_request
AFTER INSERT ON campaign_requests
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
    'https://gcpynlcutvjfptkedplm.supabase.co/functions/v1/new-campaign-request', 
    'POST',
    '{\"Content-Type\":\"application/json\"}',
    '{}',
    '1000'
);
