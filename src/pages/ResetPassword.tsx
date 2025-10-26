import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import Layout from '@/Components/Layout';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AlertCircle, Save } from 'lucide-react';
import PasswordInput from '@/Components/PasswordInput';

type FormInputs = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormInputs>();
  const password = watch('password');

  const handleReset: SubmitHandler<FormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully! You can now log in.");
      setTimeout(() => navigate('/customer/login'), 3000);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Set a New Password</h1>
            <p className="text-gray-600">Enter a new password for your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                {message}
            </div>
          )}

          <form onSubmit={handleSubmit(handleReset)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <PasswordInput 
                  register={register('password', { required: 'Password is required'})} 
                  placeholder='Enter your new password'
                  autoComplete='new-password'
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <PasswordInput 
                  register={register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'The passwords do not match'
                  })} 
                  placeholder='Confirm your new password'
                  autoComplete='new-password'
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
                <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                {loading ? 'Saving...' : <><Save className="w-5 h-5 mr-2"/>Save New Password</>}
                </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
