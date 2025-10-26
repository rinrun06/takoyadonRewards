import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// This function will be called by the admin signup form.
// It securely creates a new user, a user profile, and a staff record with an 'inactive' status pending approval.

Deno.serve(async (req) => {
  // 1. Handle preflight CORS request for browser security
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Extract the user's data from the incoming request
    const { fullName, email, password, role } = await req.json()

    if (!fullName || !email || !password || !role) {
      throw new Error("Missing required fields: fullName, email, password, and role are required.");
    }

    // 3. Create a Supabase client with full administrative privileges.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Create the new user in the Supabase authentication system.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // User is created as confirmed.
      user_metadata: { 
        full_name: fullName,
        // The 'pending' status is managed by the 'is_active' flag in the 'staff' table.
      },
    })

    if (authError) throw authError;

    const userId = authData.user.id;

    // 5. Create a corresponding profile for the user in the public 'users' table.
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        display_name: fullName,
        role: role, // Assign the user's role (e.g., 'franchise_admin', 'branch_staff')
      });

    if (usersError) throw usersError;

    // 6. Create the record in the 'staff' table, linking the user to their staff role.
    // The 'is_active' flag is set to false, indicating the account is pending approval.
    const { error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({
        user_id: userId,
        role: role,
        is_active: false // Mark the account as inactive until a super admin approves it.
      });

    if (staffError) throw staffError;

    // 7. If all steps succeed, return a success response.
    return new Response(JSON.stringify({ message: "Admin user created successfully. Awaiting approval." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 8. If any step fails, return a clear error message.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
