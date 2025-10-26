import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, Users, Gift, MessageSquare } from "lucide-react";
import Layout from "@/Components/Layout";
// In a real app, you would use a charting library like Chart.js or Recharts
// For this example, we'll use a simple placeholder for charts.

const ChartPlaceholder = ({ title }: { title: string }) => (
    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 font-medium">{title}</p>
    </div>
);

export default function ReportsPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/admin/branch-staff" className="flex items-center text-gray-600 hover:text-black mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-black">Branch Reports & Analytics</h1>
                    <p className="text-gray-600">Performance insights for your branch.</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500"/>
                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500">
                    <option>Last 7 Days</option>
                    <option>This Month</option>
                    <option>Last 30 Days</option>
                    <option>Custom Range</option>
                </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-xl flex items-center">
                <Users className="w-8 h-8 text-blue-500 mr-4"/>
                <div>
                    <p className="text-sm text-gray-500">New Customers</p>
                    <p className="text-2xl font-bold text-black">128</p>
                </div>
            </div>
             <div className="bg-gray-50 p-6 rounded-xl flex items-center">
                <Gift className="w-8 h-8 text-green-500 mr-4"/>
                <div>
                    <p className="text-sm text-gray-500">Rewards Redeemed</p>
                    <p className="text-2xl font-bold text-black">76</p>
                </div>
            </div>
             <div className="bg-gray-50 p-6 rounded-xl flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-500 mr-4"/>
                <div>
                    <p className="text-sm text-gray-500">Feedback Received</p>
                    <p className="text-2xl font-bold text-black">32</p>
                </div>
            </div>
          </div>
          
          {/* Charts and Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                  <h3 className="text-xl font-bold text-black mb-4">Daily Check-ins</h3>
                  <ChartPlaceholder title="Daily Check-ins Chart"/>
              </div>
               <div>
                  <h3 className="text-xl font-bold text-black mb-4">Popular Redeemed Rewards</h3>
                  <ChartPlaceholder title="Redeemed Rewards Bar Chart"/>
              </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
