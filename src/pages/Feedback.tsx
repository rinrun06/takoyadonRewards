import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import { 
  MessageSquare, 
  Star, 
  Send, 
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  UploadCloud,
  File as FileIcon,
  ArrowLeft
} from "lucide-react";
import Layout from "@/Components/Layout";
import { Link } from "react-router-dom";
import type { Branch, Feedback as FeedbackType } from "@/shared/types";

export default function Feedback() {
  const { session, loading } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userFeedback, setUserFeedback] = useState<(FeedbackType & { branch_name: string })[]>([]);
  const [formData, setFormData] = useState({
    branch_id: 0,
    type: 'general' as 'general' | 'complaint' | 'suggestion',
    rating: 0,
    message: '',
    photo_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase.from('branches').select('id, name, address, phone, franchise_id, company_owned_id, is_active');
      if (error) throw error;
      if (data) {
        setBranches(data as Branch[]);
        if (formData.branch_id === 0 && data.length > 0) {
          setFormData(prev => ({ ...prev, branch_id: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      setSubmitError('Failed to load branches.');
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBranches();
      if (session?.user) {
        await fetchUserFeedback(session.user.id);
      }
    };
    fetchInitialData();
  }, [session, fetchBranches]);

  const fetchUserFeedback = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          created_at,
          type,
          rating,
          message,
          photo_url,
          branch_id,
          user_id,
          branches(name)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      if (data) {
        setUserFeedback(data.map(item => ({ ...item, branch_name: (item.branches as any)?.name || 'Unknown' })));
      }
    } catch (error) {
      console.error('Failed to fetch feedback history:', error);
      setSubmitError('Failed to load feedback history.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setSubmitError("You must be logged in to submit feedback.");
      return;
    }

    if (!formData.branch_id || !formData.message.trim()) {
      setSubmitError('Please select a branch and enter your feedback.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      let photoUrl = '';
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('feedback-images')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        photoUrl = uploadData?.path ? supabase.storage.from('feedback-images').getPublicUrl(uploadData.path).data.publicUrl : '';
      }

      const { error: dbError } = await supabase.from("feedback").insert({
        user_id: session.user.id,
        branch_id: formData.branch_id,
        type: formData.type,
        rating: formData.rating === 0 ? null : formData.rating,
        message: formData.message,
        photo_url: photoUrl || null,
      });

      if (dbError) throw dbError;

      setSubmitSuccess(true);
      if (session?.user) {
        await fetchUserFeedback(session.user.id);
      }
      setFormData({ ...formData, message: '', rating: 0, photo_url: '' });
      setSelectedFile(null);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('history');
      }, 3000);
    } catch (e: any) {
      console.error("Error submitting feedback:", e);
      setSubmitError(`Failed to submit feedback: ${e.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
            <Link to="/home" className="inline-flex items-center text-gray-600 hover:text-red-600 font-medium transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
            </Link>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4 shadow-xl">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-black mb-3">Share Your Experience</h1>
          <p className="text-gray-700 text-lg max-w-lg mx-auto leading-relaxed">
            Your feedback helps us improve. Please share your experience.
          </p>
        </div>

        {session?.user && (
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('submit')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === 'submit' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                Submit Feedback
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === 'history' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                Your Feedback ({userFeedback.length})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'submit' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-7">
            {submitSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 text-sm">Feedback submitted successfully! Redirecting to history...</span>
              </div>
            )}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{submitError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which restaurant are you reviewing? *
                </label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200"
                  required
                >
                  <option value={0}>Select a Takoyadon location</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of feedback
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'general', label: 'General', icon: MessageSquare },
                    { value: 'complaint', label: 'Complaint', icon: AlertCircle },
                    { value: 'suggestion', label: 'Suggestion', icon: ThumbsUp }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value as 'general' | 'complaint' | 'suggestion' })}
                      className={`p-3 border-2 rounded-xl transition-all ${formData.type === type.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <type.icon className={`w-5 h-5 mx-auto mb-2 ${formData.type === type.value ? 'text-red-600' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium ${formData.type === type.value ? 'text-red-800' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall rating (optional)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="p-1 transition-transform hover:scale-110">
                      <Star
                        className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your feedback *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How was your Takoyaki? Was the Donburi authentic? Any suggestions for our Yakisoba?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a photo (optional)
                </label>
                <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center px-1 py-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all">
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                {selectedFile && (
                  <div className="mt-4 flex items-center justify-center text-sm text-gray-700">
                    <FileIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{selectedFile.name}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !session?.user}
                className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback
                  </>
                )}
              </button>
              {!session?.user && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Please <Link to="/customer/login" className="text-red-600 hover:underline">log in</Link> to submit feedback.
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {userFeedback.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800">No feedback yet</h3>
              </div>
            ) : (
              userFeedback.map((feedback) => (
                <div key={feedback.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{feedback.branch_name}</h3>
                    <span className="text-xs text-gray-500">{new Date(feedback.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{feedback.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
