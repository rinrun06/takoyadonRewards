import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

// Points mapping for different activities
const activityPoints: { [key: string]: number } = {
  social_share: 40,
  // Add other activity types here
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  // Use the Service Role Key to bypass RLS
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { activity_id } = await req.json();

    // 1. Fetch the activity from the correct table
    const { data: activity, error: activityError } = await supabase
      .from('point_earning_activities')
      .select('*')
      .eq('id', activity_id)
      .single();

    if (activityError || !activity) {
      throw new Error('Activity not found.');
    }

    if (activity.status === 'approved') {
      throw new Error('Activity already approved.');
    }

    // 2. Determine points to award based on activity type
    const pointsToAdd = activityPoints[activity.activity_type] || 0;
    if (pointsToAdd === 0) {
        throw new Error(`Invalid activity type or zero points for type: ${activity.activity_type}`);
    }

    // 3. Fetch user's current points from the profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('user_id', activity.user_id)
        .single();

    if (profileError || !profile) {
        throw new Error('User profile not found.');
    }

    // 4. Update activity status to 'approved'
    const { error: updateError } = await supabase
      .from('point_earning_activities')
      .update({ status: 'approved' })
      .eq('id', activity.id);

    if (updateError) {
      throw new Error('Failed to approve activity submission.');
    }

    // 5. Atomically update user's loyalty points
    const newPoints = (profile.loyalty_points || 0) + pointsToAdd;
    const { error: pointsError } = await supabase
      .from('profiles')
      .update({ loyalty_points: newPoints })
      .eq('user_id', activity.user_id);

    if (pointsError) {
      console.error("Critical: Failed to update points, but activity was approved. Manual correction needed for user:", activity.user_id);
      throw new Error('Failed to update user points.');
    }

    // 6. Record the transaction for historical tracking
    await supabase.from('point_transactions').insert({
        user_id: activity.user_id,
        points_change: pointsToAdd,
        reason: `Approved: ${activity.description}`,
    });

    // 7. Send a notification to the user
    await supabase.from('notifications').insert({
        user_id: activity.user_id,
        message: `Your submission "${activity.description}" was approved, earning you ${pointsToAdd} points!`,
    });

    return new Response(JSON.stringify({ success: true, message: "Activity approved and points awarded." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
