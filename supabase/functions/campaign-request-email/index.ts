
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPER_ADMIN_EMAIL = Deno.env.get('SUPER_ADMIN_EMAIL');

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const { record: newRequest } = await req.json();

  // Get the name of the user who made the request
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', newRequest.requesting_user_id)
    .single();

  // Get the name of the branch for which the request was made
  const { data: branch, error: branchError } = await supabase
    .from('branches')
    .select('name')
    .eq('id', newRequest.requesting_branch_id)
    .single();

  if (userError || branchError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user or branch details' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const emailHtml = `
    <h1>New Campaign Request</h1>
    <p>A new campaign request has been submitted by <strong>${user.full_name}</strong> from the <strong>${branch.name}</strong> branch.</p>
    <h2>Request Details:</h2>
    <ul>
      <li><strong>Campaign Name:</strong> ${newRequest.name}</li>
      <li><strong>Description:</strong> ${newRequest.description}</li>
      <li><strong>Proposed Start Date:</strong> ${newRequest.proposed_start_date}</li>
      <li><strong>Proposed End Date:</strong> ${newRequest.proposed_end_date}</li>
    </ul>
    <p>Please log in to the admin dashboard to review, approve, or reject this request.</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: SUPER_ADMIN_EMAIL,
      subject: 'New Campaign Request Submitted',
      html: emailHtml,
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
