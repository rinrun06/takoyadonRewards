import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gift, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import Layout from "../../Components/Layout";

type RedemptionStatus = "Pending" | "Approved" | "Denied";

interface Item {
  name: string;
  description: string;
  points_required: number;
}

interface Redemption {
  id: number;
  customer: string;
  item: Item;
  status: RedemptionStatus;
  date: string;
}

const mockRedemptions: Redemption[] = [
  { id: 1, customer: "John Doe", item: { name: "Free Drink", description: "Any medium-sized drink", points_required: 50 }, status: "Pending", date: "2024-07-28" },
  { id: 2, customer: "Jane Smith", item: { name: "Discount Voucher", description: "10% off entire order", points_required: 100 }, status: "Pending", date: "2024-07-28" },
  { id: 3, customer: "Alice Johnson", item: { name: "Free Appetizer", description: "Any appetizer up to $10", points_required: 75 }, status: "Approved", date: "2024-07-27" },
  { id: 4, customer: "Bob Williams", item: { name: "Free Drink", description: "Any medium-sized drink", points_required: 50 }, status: "Denied", date: "2024-07-26" },
  { id: 5, customer: "John Doe", item: { name: "Discount Voucher", description: "10% off entire order", points_required: 100 }, status: "Approved", date: "2024-07-25" },
];

export default function RedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>(mockRedemptions);
  const [filter, setFilter] = useState<RedemptionStatus | "All">("All");

  const handleApprove = (id: number) => {
    setRedemptions(redemptions.map(r => r.id === id ? { ...r, status: "Approved" } : r));
  };

  const handleDeny = (id: number) => {
    setRedemptions(redemptions.map(r => r.id === id ? { ...r, status: "Denied" } : r));
  };

  const filteredRedemptions = filter === "All" ? redemptions : redemptions.filter(r => r.status === filter);

  const statusStyles = {
    Pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100" },
    Approved: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
    Denied: { icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/admin/branch-staff" className="flex items-center text-gray-600 hover:text-black mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
                  <Gift className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-black">Manage Redemptions</h1>
                    <p className="text-gray-600">Approve or decline customer point redemptions.</p>
                </div>
            </div>
            <Link to="/staff/scan-qr" className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-md">
                Scan Redemption QR
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                  {(["All", "Pending", "Approved", "Denied"] as const).map(f => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === f ? 'bg-white text-black shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                          {f}
                      </button>
                  ))}
              </div>
              <div className="relative mt-4 sm:mt-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input type="text" placeholder="Search customer..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"/>
              </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRedemptions.map(r => {
                    const StatusIcon = statusStyles[r.status].icon;
                    return (
                        <tr key={r.id}>
                            <td className="py-4 px-4 whitespace-nowrap"><span className="font-medium text-black">{r.customer}</span></td>
                            <td className="py-4 px-4 whitespace-nowrap text-gray-600">{r.item.name} ({r.item.points_required} pts)</td>
                            <td className="py-4 px-4 whitespace-nowrap text-gray-600">{r.date}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[r.status].bg} ${statusStyles[r.status].color}`}>
                                    <StatusIcon className="w-4 h-4 mr-1.5" />
                                    {r.status}
                                </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                {r.status === 'Pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(r.id)} className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs">Approve</button>
                                    <button onClick={() => handleDeny(r.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs">Deny</button>
                                </div>
                                )}
                                <button className="text-red-600 hover:underline text-xs">View History</button>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
