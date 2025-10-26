import { useState, useEffect, type FormEvent, useCallback, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import {
  Star,
  MessageSquare,
  MapPin,
  Users,
  Receipt,
  Trophy,
  CheckCircle,
  Upload,
  Copy,
  ArrowLeft,
  History,
  Share2,
  Gift,
  UserCheck,
  QrCode
} from "lucide-react";
import Layout from "@/Components/Layout";
import { Link, useNavigate } from "react-router-dom";
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LucideProps } from "lucide-react";
import { activityService, type PointActivity } from "@/Services/activityService";

// --- Type Definitions ---
interface PointOpportunity {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  color: string;
  path?: string;
  action?: () => void;
}

// --- Helper Components ---
const ActionModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      requestAnimationFrame(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      });
    } else {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as NodeListOf<HTMLElement>;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4" role="document">
        <h2 id="modal-title" className="text-xl font-bold text-black mb-6" tabIndex={0}>{title}</h2>
        {children}
        <button onClick={onClose} className="mt-6 w-full text-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all">
          Close
        </button>
      </div>
    </div>
  );
};

const OpportunityCard = ({ op, onAction, isCompleted }: { op: PointOpportunity, onAction: (op: PointOpportunity) => void, isCompleted: boolean }) => {
  if (op.path && !isCompleted) {
    return (
      <Link to={op.path} className={`block h-full bg-white rounded-2xl p-6 shadow-lg border-2 transition-all border-red-100 hover:shadow-xl hover:scale-105 cursor-pointer`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${op.color} rounded-xl flex items-center justify-center`}>
            <op.icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-xl font-bold text-black">+{op.points}</div>
        </div>
        <h3 className="font-semibold text-black mb-1">{op.title}</h3>
        <p className="text-sm text-gray-600">{op.description}</p>
      </Link>
    );
  }

  return (
    <div
      onClick={() => !isCompleted && onAction(op)}
      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all h-full ${
        !isCompleted
          ? "border-red-100 hover:shadow-xl hover:scale-105 cursor-pointer"
          : "border-gray-200 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${op.color} rounded-xl flex items-center justify-center`}>
          <op.icon className="w-6 h-6 text-white" />
        </div>
        {isCompleted ? (
          <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" /> Done
          </div>
        ) : (
          <div className="text-xl font-bold text-black">+{op.points}</div>
        )}
      </div>
      <h3 className="font-semibold text-black mb-1">{op.title}</h3>
      <p className="text-sm text-gray-600">{op.description}</p>
    </div>
  );
}

// --- Main Component ---
export default function EarnPoints() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [userPoints, setUserPoints] = useState(0);
  const [todaysPoints, setTodaysPoints] = useState(0);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointActivity[]>([]);
  const [pointOpportunities, setPointOpportunities] = useState<PointOpportunity[]>([]);
  const [modalState, setModalState] = useState<{ type: string | null; title: string }>({ type: null, title: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const dailyGoal = 200;
  const progressPercentage = Math.min((todaysPoints / dailyGoal) * 100, 100);

  const completeAction = useCallback(async (id: string, description: string, points: number) => {
    if (!session?.user) return;
    const newActivity = await activityService.addActivity({
      userId: session.user.id,
      description,
      points,
      type: 'earn'
    });

    setUserPoints(prev => prev + points);
    setTodaysPoints(prev => prev + points);
    setCompletedActions(prev => [...prev, id]);
    setPointsHistory(prev => [newActivity, ...prev]);
    setModalState({ type: null, title: '' });
  }, [session?.user]);

  const handleBirthdayBonus = useCallback(() => {
    if (!profile?.birthday_date) {
      navigate('/profile?highlight=birthday');
      return;
    }

    const today = new Date();
    const birthday = new Date(profile.birthday_date);
    const isBirthday = today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate();

    if (!isBirthday) {
      setModalState({
        type: 'birthday_info',
        title: 'Birthday Bonus'
      });
      return;
    }

    const opportunity = pointOpportunities.find(op => op.id === 'birthday_visit');
    if (opportunity) {
      completeAction(opportunity.id, opportunity.title, opportunity.points);
    }
  }, [profile, pointOpportunities, navigate, completeAction]);

  const fetchPointEarningRules = useCallback(async (userId: string) => {
    const coreOpportunities: PointOpportunity[] = [
      {
        id: 'visit_branch',
        title: 'Visit a Branch',
        description: 'Scan the QR code at any branch to check in and earn points.',
        points: 25,
        icon: MapPin,
        color: 'from-cyan-500 to-blue-600',
        action: () => setModalState({ type: 'qr_info', title: 'How to Check-In' })
      },
      {
        id: 'refer_friend',
        title: 'Refer a Friend',
        description: 'Earn points when your friends sign up and order.',
        points: 150,
        icon: Users,
        color: 'from-purple-500 to-violet-600',
        action: () => setModalState({ type: 'referral', title: 'Refer a Friend' })
      },
      {
        id: 'submit_feedback',
        title: 'Submit Feedback',
        description: 'Tell us about your experience.',
        points: 20,
        icon: MessageSquare,
        color: 'from-blue-500 to-sky-600',
        path: '/feedback'
      },
      {
        id: 'social_share',
        title: 'Share on Social Media',
        description: 'Share a post about us and submit the link to earn points.',
        points: 40,
        icon: Share2,
        color: 'from-teal-500 to-cyan-600',
        action: () => setModalState({ type: 'social_link', title: 'Submit Your Social Media Post' })
      },
      {
        id: 'birthday_visit',
        title: 'Birthday Visit',
        description: 'Get a special bonus on your birthday!',
        points: 100,
        icon: Gift,
        color: 'from-pink-500 to-rose-600',
        action: handleBirthdayBonus
      },
      {
        id: 'complete_profile',
        title: 'Complete Your Profile',
        description: 'Fill out your profile for easy points.',
        points: 30,
        icon: UserCheck,
        color: 'from-indigo-500 to-blue-600',
        path: '/profile'
      },
      {
        id: 'upload_receipt',
        title: 'Upload Receipt',
        description: 'Missed points? Upload your receipt.',
        points: 30,
        icon: Receipt,
        color: 'from-orange-500 to-red-600',
        action: () => setModalState({ type: 'upload', title: 'Upload Your Receipt' })
      },
    ];

    setPointOpportunities(coreOpportunities);

    const userHistory = await activityService.getActivitiesForUser(userId);
    setPointsHistory(userHistory.filter(act => act.type === 'earn'));

    const completedIds = userHistory
      .filter(act => act.type === 'earn')
      .map(act => {
        if (act.description.includes('feedback') || act.description.includes('Feedback')) return 'submit_feedback';
        if (act.description.includes('birthday') || act.description.includes('Birthday')) return 'birthday_visit';
        if (act.description.includes('profile') || act.description.includes('Profile')) return 'complete_profile';
        if (act.description.includes('receipt') || act.description.includes('Receipt')) return 'upload_receipt';
        if (act.description.includes('social') || act.description.includes('Social')) return 'social_share';
        if (act.description.includes('refer') || act.description.includes('Refer')) return 'refer_friend';
        if (act.description.includes('visit') || act.description.includes('Visit')) return 'visit_branch';
        return null;
      })
      .filter(Boolean) as string[];

    setCompletedActions(completedIds);
  }, [handleBirthdayBonus]);

  useEffect(() => {
    if (session?.user && profile) {
      setUserPoints(profile.loyalty_points || 0);
      fetchPointEarningRules(session.user.id);
    }
  }, [session, profile, fetchPointEarningRules]);

  const handleAction = useCallback((op: PointOpportunity) => {
    if (completedActions.includes(op.id)) return;

    if (op.action) {
      op.action();
    } else if (op.path) {
      navigate(op.path);
    }
  }, [completedActions, navigate]);

  const handleFileUpload = useCallback(async () => {
    setSubmitting(true);
    setSubmissionMessage('');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmissionMessage('Receipt submitted for review!');

    const opportunity = pointOpportunities.find(op => op.id === 'upload_receipt');
    if (opportunity) {
      completeAction(opportunity.id, opportunity.title, opportunity.points);
    }
  }, [pointOpportunities, completeAction]);

  const handleSocialLinkSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    setSubmitting(true);
    setSubmissionMessage('');
    const socialUrl = e.currentTarget.social_url.value;

    try {
      const { error } = await supabase
        .from('point_earning_activities')
        .insert([
          {
            user_id: session.user.id,
            activity_type: 'social_share',
            description: socialUrl,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      setSubmissionMessage('Thank you! Your submission has been received and is pending review.');
      setCompletedActions(prev => [...prev, 'social_share']);
      setTimeout(() => {
        setModalState({ type: null, title: '' });
      }, 2000);

    } catch (error) {
      if (error instanceof Error) {
        setSubmissionMessage(`Error: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  }, [session?.user]);

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div></Layout>;

  if (!session?.user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign In to Earn Points</h1>
          <p className="text-gray-600 mb-6">Join our loyalty program to start earning points and redeeming amazing rewards!</p>
          <Link to="/customer/login" className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all">Sign In & Start Earning</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/home" className="flex items-center text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />Back to Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Earn Points</h1>
          <p className="text-lg text-gray-600">Complete actions to earn points and unlock exclusive rewards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100 flex items-center justify-between">
            <div>
                <div className="text-4xl font-bold text-black">{userPoints.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
              <Star className="w-8 h-8" />
            </div>
          </div>
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
            <h3 className="font-bold text-black mb-2">Today's Progress</h3>
            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
              <span>{todaysPoints} pts earned</span>
              <span>Daily Goal: {dailyGoal} pts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-black mb-6">Ways to Earn Points</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pointOpportunities.map((op) => (
                <OpportunityCard
                  key={op.id}
                  op={op}
                  onAction={handleAction}
                  isCompleted={completedActions.includes(op.id)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <History className="w-6 h-6 text-black mr-3" />
              <h2 className="text-2xl font-bold text-black">Points History</h2>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100 space-y-4">
              {pointsHistory.length > 0 ? pointsHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{item.description}</p>
                    <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${item.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'earn' ? '+' : '-'}{item.points} pts
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center py-4">Your earned points history will appear here.</p>}
            </div>
          </div>
        </div>
      </div>

      <ActionModal isOpen={modalState.type === 'upload'} onClose={() => setModalState({ type: null, title: '' })} title={modalState.title}>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Click the button below to upload your file.</p>
          <button
            onClick={handleFileUpload}
            disabled={submitting}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          {submissionMessage && (
            <p className="mt-4 text-green-600 font-semibold">{submissionMessage}</p>
          )}
        </div>
      </ActionModal>

      <ActionModal isOpen={modalState.type === 'referral'} onClose={() => setModalState({ type: null, title: '' })} title="Refer a Friend">
        <p className="text-gray-600 mb-4">Share this link with friends. You'll get points when they sign up!</p>
        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
          <input
            type="text"
            readOnly
            value={`https://takoyadon.com/refer?ref=${session?.user.id}`}
            className="w-full bg-transparent text-gray-800 focus:outline-none"
          />
          <button
            onClick={() => navigator.clipboard.writeText(`https://takoyadon.com/refer?ref=${session?.user.id}`)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <span className="sr-only">Copy referral link</span>
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </ActionModal>

      <ActionModal isOpen={modalState.type === 'qr_info'} onClose={() => setModalState({ type: null, title: '' })} title="How to Check-In">
        <div className="text-center">
            <QrCode className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Simply use your phone's camera to scan the unique QR code available at any of our branches.</p>
            <p className="text-gray-600">This will automatically check you in, track your visit, and award your points!</p>
        </div>
      </ActionModal>

      <ActionModal isOpen={modalState.type === 'social_link'} onClose={() => { setModalState({ type: null, title: '' }); setSubmissionMessage(''); }} title="Submit Your Social Media Post">
        <form onSubmit={handleSocialLinkSubmit}>
          {!submissionMessage ? (
            <>
              <p className="text-gray-600 mb-4">Post about us on your social media, then paste the link to your post below to claim your points.</p>
              <input
                  type="url"
                  name="social_url"
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  required
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                  {submitting ? 'Submitting...' : 'Submit Link'}
              </button>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">{submissionMessage}</p>
            </div>
          )}
        </form>
      </ActionModal>

      <ActionModal isOpen={modalState.type === 'birthday_info'} onClose={() => setModalState({ type: null, title: '' })} title="Birthday Bonus">
        <div className="text-center">
          <Gift className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Your birthday bonus is available on your actual birthday!
            {profile?.birthday_date ? (
              <> Your birthday is set to <strong>{new Date(profile.birthday_date).toLocaleDateString()}</strong>.</>
            ) : (
              <> Please make sure your birthday is set in your profile.</>
            )}
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-all"
          >
            Update Profile
          </button>
        </div>
      </ActionModal>
    </Layout>
  );
}
