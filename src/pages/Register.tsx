import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Layout from '@/Components/Layout';
import PasswordInput from '@/Components/PasswordInput';
import { FcGoogle } from 'react-icons/fc';

// Define the type for your form inputs
type FormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormInputs>();
  const password = watch('password');

  const handleRegister: SubmitHandler<FormInputs> = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      setError(error.message)
    } else {
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/customer/check-email');
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Create Your Account</h1>
            <p className="text-gray-600">Join to start earning rewards</p>
          </div>

          {/* Added aria-live for accessibility */}
          <div aria-live="polite">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
          </div>



          <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                aria-describedby="email-error" // Added aria-describedby
                placeholder='Enter your email'

              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <PasswordInput 
                register={register('password', { required: 'Password is required'})}
                placeholder='Enter your password'
                aria-describedby="password-error" // Added aria-describedby
             />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <PasswordInput 
                register={register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'The passwords do not match'
                })} 
                placeholder='Confirm your password'               
                aria-describedby="confirmPassword-error" // Added aria-describedby
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex justify-center items-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button 
              onClick={handleGoogleLogin} 
              disabled={loading} 
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <FcGoogle className="w-6 h-6 mr-3" />
              Sign up with Google
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-red-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
