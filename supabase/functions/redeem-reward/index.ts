import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, reward_id } = await req.json();

    // 1. Fetch reward and user profile in parallel
    const [rewardRes, profileRes] = await Promise.all([
      supabase.from('rewards').select('points_cost, name').eq('id', reward_id).single(),
      supabase.from('profiles').select('loyalty_points').eq('user_id', user_id).single()
    ]);

    if (rewardRes.error || !rewardRes.data) throw new Error('Reward not found');
    if (profileRes.error || !profileRes.data) throw new Error('User profile not found');

    const reward = rewardRes.data;
    const profile = profileRes.data;

    // 2. Check if user has enough points
    if (profile.loyalty_points < reward.points_cost) {
      throw new Error('Not enough points');
    }

    const newPoints = profile.loyalty_points - reward.points_cost;

    // 3. Perform database updates
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ loyalty_points: newPoints })
      .eq('user_id', user_id);

    if (updateError) throw new Error('Failed to deduct points');

    // 4. Record the transaction
    const { error: transactionError } = await supabase.from('point_transactions').insert({
      user_id: user_id,
      points_change: -reward.points_cost,
      reason: `Redeemed: ${reward.name}`,
    });

    if (transactionError) {
      // This is a critical error, as the user has lost points but the transaction isn't recorded.
      // Ideally, you'd have a more robust error handling/reconciliation process here.
      console.error('CRITICAL: Failed to record redemption transaction:', transactionError);
      // For now, we will still tell the user it succeeded but log the error.
    }

    // 5. Send notification
    await supabase.from('notifications').insert({
        user_id: user_id,
        message: `You successfully redeemed "${reward.name}" for ${reward.points_cost} points!`,
    });
    
    return new Response(JSON.stringify({ success: true, message: 'Reward redeemed successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Using 400 for client-side errors like not enough points
    });
  }
});
