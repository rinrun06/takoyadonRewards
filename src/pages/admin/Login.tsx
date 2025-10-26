import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Shield } from 'lucide-react';
import Layout from '@/Components/Layout';
import PasswordInput from '@/Components/PasswordInput';

type FormInputs = {
  email: string;
  password: string;
};

const AdminLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormInputs>();

  const handleLogin: SubmitHandler<FormInputs> = async ({ email, password }) => {
    setError(null);
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (authData.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        setError('Could not find user profile. Please contact support.');
        return;
      }

      const userRole = userData.role;

      if (userRole === 'customer') {
        setError('This is an admin-only login. Please use the customer portal.');
        await supabase.auth.signOut();
        return;
      }

      if (userRole === 'super_admin') {
        navigate('/admin/super-admin');
        return;
      }

      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('role, branch_id')
        .eq('user_id', authData.user.id)
        .single();
      
      if (staffError || !staffData) {
          setError('Could not find staff details. Please contact support.');
          await supabase.auth.signOut();
          return;
      }

      switch (staffData.role) {
        case 'franchise_admin':
          navigate('/admin/franchise-admin');
          break;
        case 'branch_staff':
          navigate('/admin/branch-staff');
          break;
        case 'manager':
            navigate('/admin/manager');
            break;
        default:
          setError('Invalid staff role for admin access.');
          await supabase.auth.signOut();
      }
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues('email');
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setError(null);
    try {
      await supabase.auth.resetPasswordForEmail(email);
      setMessage(`If an account exists for ${email}, a password reset link has been sent.`);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setMessage(`If an account exists for ${email}, a password reset link has been sent.`);
    };
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6 shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">Admin Panel</h1>
            <p className="text-gray-600">Please sign in to continue.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  id="email" 
                  type="email" 
                  {...register('email', { required: 'Email is required'})} 
                  className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 transition-shadow" 
                  placeholder="Enter your email"
                />
                 {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button type="button" onClick={handleForgotPassword} className="text-sm text-red-600 hover:underline">Forgot password?</button>
                </div>
                <PasswordInput 
                  register={register('password', { required: 'Password is required'})} 
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {message && <p className="text-green-500 text-sm text-center">{message}</p>}

              <div>
                <button type="submit" className="w-full py-3 px-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
                  Sign In
                </button>
              </div>
            </form>
            <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                    Need an admin account?{' '}
                    <Link to="/admin/signup" className="font-medium text-red-600 hover:underline">
                        Register for Approval
                    </Link>
                </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
