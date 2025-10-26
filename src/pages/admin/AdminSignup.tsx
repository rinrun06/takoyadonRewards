
import { supabase } from '@/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import Layout from '@/Components/Layout';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import PasswordInput from '@/Components/PasswordInput';

type Inputs = {
  fullName: string;
  email: string;
  password: string; 
  role: 'franchise_admin' | 'branch_staff';
};

export default function AdminSignup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Inputs>();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false); 

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const { error } = await supabase.functions.invoke('admin-signup', {
        body: data,
      });

      if (error) {
        throw new Error(error.message);
      }
      
      setIsSuccess(true);

    } catch (err: any) {
      console.error('Error submitting registration request:', err);
      const errorMessage = err.message || 'There was an issue submitting your request. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-2xl mb-6 shadow-xl">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">Admin Registration</h1>
            <p className="text-gray-600">Create a new admin or staff account for approval.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {isSuccess ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Registration Submitted!</h2>
                <p className="text-gray-700 mb-6">
                  The account has been created and is now pending approval from a super administrator. You will be notified via email once your account is activated.
                </p>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="w-full flex justify-center items-center px-4 py-3 text-white bg-gray-800 rounded-lg hover:bg-black"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    {...register('fullName', { required: 'Full name is required' })}
                    className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder='Enter your full name'
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' } })}
                    className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder='Enter your email'
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <PasswordInput
                    register={register('password', { required: 'Password is required' })}
                    placeholder='Enter your password'
                    autoComplete="new-password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    {...register('role', { required: 'Please select a role' })}
                    className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- Select a Role --</option>
                    <option value="branch_staff">Branch Staff</option>
                    <option value="franchise_admin">Franchise Admin</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Submitting...' : 'Register for Approval'}
                  </button>
                </div>
              </form>
            )}
            <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/admin/login" className="font-medium text-red-600 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
