import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import Layout from "../../Components/Layout";
import { supabase } from "../../supabaseClient";

type FeedbackStatus = "New" | "Read" | "Replied";

interface Feedback {
  id: number;
  customer: string;
  rating: number;
  comment: string;
  status: FeedbackStatus;
  reply?: string;
}

export default function StaffFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*');
      if (error) {
        console.error('Error fetching feedback:', error);
      } else {
        setFeedback(data as Feedback[]);
      }
    };

    fetchFeedback();
  }, []);

  const handleReplySubmit = async (id: number) => {
    const { error } = await supabase
      .from('feedback')
      .update({ status: 'Replied', reply: replyText })
      .eq('id', id);

    if (error) {
      console.error('Error submitting reply:', error);
    } else {
        setFeedback(feedback.map(f => f.id === id ? { ...f, status: "Replied" as FeedbackStatus, reply: replyText } : f));
        setReplyingTo(null);
        setReplyText("");
    }
  };

  const statusStyles = {
    New: "bg-red-100 text-red-800",
    Read: "bg-gray-100 text-gray-800",
    Replied: "bg-green-100 text-green-800",
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/admin/branch-staff" className="flex items-center text-gray-600 hover:text-black mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
           <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-4xl font-bold text-black">Customer Feedback</h1>
                <p className="text-gray-600">Review and respond to recent feedback.</p>
            </div>
          </div>
          <ul className="space-y-6">
            {feedback.map(f => (
              <li key={f.id} className="p-4 bg-gray-50 rounded-lg transition-shadow duration-300 hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-black">{f.customer}</p>
                    <p className="text-sm text-gray-500">Rating: <span className="font-semibold text-yellow-500">{f.rating}/5 Stars</span></p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[f.status]}`}>{f.status}</span>
                </div>
                <p className="text-gray-700 mb-4">{f.comment}</p>

                {f.status === "Replied" && f.reply && (
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <p className="text-sm font-semibold text-green-800">Your Reply:</p>
                        <p className="text-sm text-gray-700 italic">"{f.reply}"</p>
                    </div>
                )}
                
                {replyingTo !== f.id && f.status !== "Replied" && (
                    <button onClick={() => setReplyingTo(f.id)} className="text-sm font-semibold text-red-600 hover:underline">
                        Write a reply
                    </button>
                )}

                {replyingTo === f.id && (
                    <div className="mt-4">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            placeholder="Your reply..."
                        />
                        <div className="flex justify-end items-center mt-2 space-x-2">
                            <button onClick={() => setReplyingTo(null)} className="text-sm font-semibold text-gray-600">Cancel</button>
                            <button onClick={() => handleReplySubmit(f.id)} className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700">
                                <Send className="w-4 h-4 mr-2"/>
                                Send Reply
                            </button>
                        </div>
                    </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
