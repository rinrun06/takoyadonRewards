
-- Create a webhook to trigger the referral-signup function on new user creation
CREATE OR REPLACE FUNCTION trigger_referral_signup_webhook()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger the referral-signup Edge Function when a new user is created
    PERFORM http_post(
        'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/referral-signup',
        json_build_object('record', row_to_json(NEW))::text,
        'application/json'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that executes the webhook function after a new user is inserted
CREATE TRIGGER on_new_user_created_trigger_webhook
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE trigger_referral_signup_webhook();
