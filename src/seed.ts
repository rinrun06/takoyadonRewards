import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("FATAL: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const seedUsers = [
  {
    email: 'superadmin@takoyadon.com',
    password: 'NFSsuperAdmin123',
    role: 'super_admin',
  },
  {
    email: 'franchiseadmin@takoyadon.com',
    password: 'nfsFranchis123',
    role: 'franchise_admin',
  },
  {
    email: 'branchstaff@takoyadon.com',
    password: 'staffNFS123',
    role: 'branch_staff',
  },
  {
    email: 'customer@takoyadon.com',
    password: 'customerNFS123',
    role: 'customer',
  },
];

async function seedDatabase() {
  console.log("Starting to seed database...");

  for (const { email, password, role } of seedUsers) {
      // 1. Get auth user or create if not exists
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error(`Error fetching existing users:`, listError.message);
        continue;
      }
      let authUser = users.find(u => u.email === email);

      if (!authUser) {
          console.log(`Creating auth user for ${email}`);
          const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
          if (error) {
              console.error(`  Error creating auth user for ${email}:`, error.message);
              continue;
          }
          authUser = data.user;
          console.log(`  Auth user created.`);
      } else {
          console.log(`Auth user for ${email} already exists.`);
          // If user exists, update their password
          const { error } = await supabase.auth.admin.updateUserById(authUser.id, { password });
          if (error) {
            console.error(`  Error updating password for ${email}:`, error.message);
            continue;
          }
          console.log(`  Password updated for ${email}.`);
      }

      if (!authUser) continue;

      // 2. Check if a public user profile exists
      const { data: publicUser, error: publicUserError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .single();

      if (publicUserError && publicUserError.code !== 'PGRST116') { // 'PGRST116' means no rows found
          console.error(`  Error checking for public profile for ${email}:`, publicUserError.message);
          continue;
      }

      // 3. Create public user profile if it doesn't exist
      if (!publicUser) {
          console.log(`  Creating public profile for ${email}`);
          const { error: createPublicUserError } = await supabase
              .from('users')
              .insert({
                  id: authUser.id,
                  email: authUser.email,
                  role: role,
                  display_name: email.split('@')[0], // a simple display name
              });

          if (createPublicUserError) {
              console.error(`  Error creating public profile for ${email}:`, createPublicUserError.message);
          } else {
              console.log(`  Public profile created.`);
          }
      } else {
          console.log(`  Public profile for ${email} already exists.`);
      }
  }

  console.log("Database seeding complete.");
}

seedDatabase().catch(console.error);
