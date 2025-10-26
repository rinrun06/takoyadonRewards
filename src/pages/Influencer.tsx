import { useState, useEffect, type FormEvent, useCallback } from 'react';
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import {
  Star,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  TrendingUp,
  Heart,
  ArrowLeft,
  FileText
} from 'lucide-react';
import type { InfluencerApplication, CreateInfluencerApplication } from '../shared/types';
import Layout from '../Components/Layout';
import { Link } from 'react-router-dom';
import FileUpload from '../Components/FileUpload';

export default function InfluencerPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const [application, setApplication] = useState<InfluencerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateInfluencerApplication, 'user_id' | 'status'>>({
    platform: 'instagram',
    handle: '',
    followers: 0,
    document_url: '',
  });

  const fetchApplication = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('influencer_applications')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setApplication(data);
    } catch (error) {
      console.error('Error fetching influencer application:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && session?.user) {
      fetchApplication(session.user.id);
    }
    setLoading(authLoading);
  }, [session, authLoading, fetchApplication]);

  const handleDocumentUploadSuccess = (filePath: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    setFormData(prev => ({ ...prev, document_url: data.publicUrl }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    if (!formData.document_url) {
        alert("Please upload a document to support your application.");
        return;
    }

    setSubmitting(true);

    try {
      const applicationData: CreateInfluencerApplication = {
        ...formData,
        user_id: session.user.id,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('influencer_applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;
      
      if(data) setApplication(data as InfluencerApplication);
      setShowForm(false);
      
      console.log(`New influencer application from user ID: ${session.user.id}`);

    } catch (error) {
      console.error('An error occurred during submission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusComponent = () => {
    const influencerStatus = application?.status || profile?.influencer_status || 'none';
    
    const statusMap = {
      approved: {
        icon: <CheckCircle className="h-5 w-5 text-green-400" />,
        title: 'Active Influencer',
        description: 'Congratulations! You are part of our influencer community.',
        color: 'border-green-500'
      },
      pending: {
        icon: <Clock className="h-5 w-5 text-yellow-400" />,
        title: 'Application Pending',
        description: 'We are reviewing your application. Please wait for our response.',
        color: 'border-yellow-500'
      },
      rejected: {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        title: 'Application Rejected',
        description: 'Your application was not approved. You can apply again after 30 days.',
        color: 'border-red-500'
      },
      none: {
        icon: <Star className="h-5 w-5 text-gray-400" />,
        title: 'Not an Influencer',
        description: 'Apply to become an influencer and unlock exclusive benefits.',
        color: 'border-gray-600'
      }
    };
    const currentStatus = statusMap[influencerStatus as keyof typeof statusMap] || statusMap.none;

    return (
        <div className={`bg-gray-900 rounded-2xl border ${currentStatus.color} p-6`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                        {currentStatus.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{currentStatus.title}</h3>
                        <p className="text-gray-400">{currentStatus.description}</p>
                    </div>
                </div>
                {influencerStatus === 'none' && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                    <Send className="mr-2 h-4 w-4" />
                    Apply Now
                </button>
                )}
            </div>
        </div>
    );
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                <p className="text-gray-400 mb-6">Please log in to view the influencer program details.</p>
                <Link to="/customer/login" className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all">
                    Log In
                </Link>
            </div>
        </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="space-y-8 text-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Influencer Program</h1>
                <p className="text-lg">Join our exclusive community and unlock amazing perks.</p>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {getStatusComponent()}

              {/* Application Form */}
              {showForm && (
                <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
                  <h2 className="text-xl font-semibold mb-6">Influencer Application</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium mb-3">Platform</label>
                        <select id="platform" name="platform" onChange={handleChange} value={formData.platform} className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white">
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="youtube">YouTube</option>
                            <option value="blog">Blog</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="handle" className="block text-sm font-medium mb-3">Social Media Handle</label>
                        <input type="text" id="handle" name="handle" onChange={handleChange} value={formData.handle} className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" placeholder="@yourhandle"/>
                    </div>
                    <div>
                        <label htmlFor="followers" className="block text-sm font-medium mb-3">Follower Count</label>
                        <input type="number" id="followers" name="followers" onChange={handleChange} value={formData.followers} className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" placeholder="10000"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Upload Supporting Document</label>
                      <FileUpload
                        bucketName="documents"
                        filePath={`${session.user.id}/applications`}
                        onUploadSuccess={handleDocumentUploadSuccess}
                        label="Upload your resume, portfolio, or media kit (PDF or image files)."
                      />
                      {formData.document_url && (
                          <div className="mt-4 p-3 bg-gray-800 rounded-lg flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-green-400"/>
                            <a href={formData.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:underline">
                                Document uploaded successfully. View file.
                            </a>
                          </div>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <button
                          type="submit"
                          disabled={submitting || !formData.document_url}
                          className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
                      >
                          {submitting ? (
                          <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                          </>
                          ) : (
                          <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Application
                          </>
                          )}
                      </button>
                      <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-6 py-3 text-sm font-medium border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                      >
                          Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-xl font-semibold text-white">Program Benefits</h2>
              {[
                { icon: Award, title: 'Exclusive Rewards', description: 'Get access to special rewards and bonus point multipliers.' },
                { icon: TrendingUp, title: 'Priority Support', description: 'Receive priority customer service and faster response times.' },
                { icon: Heart, title: 'Special Events', description: 'Get invited to exclusive tastings and restaurant events.' },
              ].map((benefit, idx) => (
                <div key={idx} className="bg-gray-900 rounded-xl border border-gray-700 p-6 flex items-start space-x-4 hover:border-red-500 transition-all duration-200">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
