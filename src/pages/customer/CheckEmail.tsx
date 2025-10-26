import Layout from '../../Components/Layout';
import { Mail } from 'lucide-react';

const CheckEmail = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6 shadow-xl">
                <Mail className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">Check Your Email</h1>
            <p className="text-gray-600 text-lg">
                We've sent a confirmation link to your email address. Please click the link to complete your registration.
            </p>
        </div>
      </div>
    </Layout>
  );
};

export default CheckEmail;
