
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  try {
    const { record: user } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if the new user was referred
    const { data: referringUser, error: referringUserError } = await supabase
      .from('profiles')
      .select('id, referred_by')
      .eq('id', user.id)
      .single();

    if (referringUserError) throw referringUserError;

    if (referringUser && referringUser.referred_by) {
      const referrerId = referringUser.referred_by;

      // Award points to the referrer
      const { error: pointsError } = await supabase.rpc('increment_loyalty_points', {
        p_user_id: referrerId,
        p_points: 100, // Award 100 points for a successful referral
      });

      if (pointsError) throw pointsError;

      // Update the referral status
      const { error: referralError } = await supabase
        .from('referrals')
        .update({ status: 'completed' })
        .eq('referrer_id', referrerId)
        .eq('referred_user_email', user.email);

      if (referralError) throw referralError;
      
      // Send a confirmation email to the referrer
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', referrerId)
        .single();

      if (referrerProfile) {
          const emailHtml = `
            <h1>Referral Successful!</h1>
            <p>Your friend, ${user.email}, has signed up using your referral code.</p>
            <p>You have been awarded 100 loyalty points!</p>
            <p>Thank you for being a loyal customer.</p>
          `;
          
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Takoyadon <noreply@takoyadon.com>",
              to: [referrerProfile.email],
              subject: "Referral Successful!",
              html: emailHtml,
            }),
          });
      }
    }

    return new Response(JSON.stringify({ message: "Referral processed" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
