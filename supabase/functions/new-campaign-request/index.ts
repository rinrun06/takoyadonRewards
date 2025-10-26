
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { data: superAdmins, error: adminError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'super_admin');

    if (adminError) throw adminError;

    const newRequest = (await req.json()).record;

    for (const admin of superAdmins) {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: admin.email,
                subject: 'New Campaign Request Submitted',
                html: `<h1>A new campaign has been requested.</h1>
                       <p><strong>Campaign Name:</strong> ${newRequest.name}</p>
                       <p><strong>Description:</strong> ${newRequest.description}</p>
                       <p><strong>Proposed Start Date:</strong> ${new Date(newRequest.proposed_start_date).toLocaleDateString()}</p>
                       <p><strong>Proposed End Date:</strong> ${new Date(newRequest.proposed_end_date).toLocaleDateString()}</p>
                       <p>Please log in to the admin panel to review it.</p>`
            })
        });
        if(!response.ok) {
            const error = await response.json();
            console.error(`Failed to send email to ${admin.email}:`, error);
        }
    }

    return new Response(JSON.stringify({ message: "Emails sent" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
