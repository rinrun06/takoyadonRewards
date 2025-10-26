import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus,
  RefreshCw,
} from "lucide-react";
import Layout from "../../Components/Layout";
import type { Branch } from "../../shared/types";
import { toast } from "react-hot-toast";

// Combined data structure for the UI
interface QRCodeDisplayData {
  id: number;
  branch_id: number;
  branch_name: string;
  owner_name: string;
  owner_type: 'franchise' | 'company_owned';
  qr_code: string;
  qr_url: string;
  scans: number;
  last_scan: string | null;
  created_at: string;
  is_active: boolean;
  download_count: number;
}

export default function QRCodes() {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCodeDisplayData[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel fetching
      const [qrCodeRes, branchesRes, franchisesRes, companyOwnedRes] = await Promise.all([
        supabase.from('qr_codes').select('*'),
        supabase.from('branches').select('*'),
        supabase.from('franchises').select('*'),
        supabase.from('company_owned').select('*'),
      ]);

      if (qrCodeRes.error) throw qrCodeRes.error;
      if (branchesRes.error) throw branchesRes.error;
      if (franchisesRes.error) throw franchisesRes.error;
      if (companyOwnedRes.error) throw companyOwnedRes.error;

      const qrCodeData = qrCodeRes.data || [];
      const branchesData = branchesRes.data || [];
      const franchisesData = franchisesRes.data || [];
      const companyOwnedData = companyOwnedRes.data || [];

      setBranches(branchesData);

      // Join data on the client-side
      const displayData = qrCodeData.map(qr => {
        const branch = branchesData.find(b => b.id === qr.branch_id);
        if (!branch) return null;

        let owner_name = "Unknown";
        let owner_type: 'franchise' | 'company_owned' = 'company_owned';

        if (branch.franchise_id) {
          owner_name = franchisesData.find(f => f.id === branch.franchise_id)?.name || 'Franchise';
          owner_type = 'franchise';
        } else if (branch.company_owned_id) {
          owner_name = companyOwnedData.find(c => c.id === branch.company_owned_id)?.name || 'Company-Owned';
        }

        return {
          ...qr,
          branch_name: branch.name,
          owner_name,
          owner_type,
        } as QRCodeDisplayData;
      }).filter((item): item is QRCodeDisplayData => item !== null);

      setQrCodes(displayData);
      setLastRefresh(new Date());

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  useEffect(() => {
    if (showCreateModal && branches.length > 0) {
      setSelectedBranch(branches[0].id);
    } else {
      setSelectedBranch(null);
    }
  }, [showCreateModal, branches]);

  const handleGenerateQRCode = async () => {
    if (!selectedBranch) {
      toast.error("Please select a branch.");
      return;
    }

    setIsSubmitting(true);

    try {
      const qr_code = `takoyadon-${selectedBranch}-${Date.now()}`;
      const qr_url = `${window.location.origin}/redeem?code=${qr_code}`;

      const { error } = await supabase
        .from('qr_codes')
        .insert({
          branch_id: selectedBranch,
          qr_code: qr_code,
          qr_url: qr_url,
          is_active: true,
        });

      if (error) {
        throw error;
      }

      toast.success("Successfully generated new QR code!");
      setShowCreateModal(false);
      fetchData();

    } catch (error: any) {
      console.error("Error generating QR code:", error);
      toast.error(`Failed to generate QR code: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <Link
            to="/admin/super-admin"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Code Management</h1>
              <p className="text-gray-600">
                Generate and manage QR codes for all branches
                <span className="text-sm text-gray-500 ml-2">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate QR Code
              </button>
            </div>
          </div>
        </div>

        {qrCodes.map(qr => <div key={qr.id}>{qr.branch_name}</div>)}

        {showCreateModal && 
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-6">Generate New QR Code</h2>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedBranch || ''}
                onChange={e => setSelectedBranch(Number(e.target.value))}
                disabled={branches.length === 0}
              >
                  <option disabled value=''>{branches.length > 0 ? 'Select a branch' : 'No branches available'}</option>
                  {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)
                  }
              </select>
              <div className="flex justify-end space-x-4 mt-6">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">Cancel</button>
                  <button 
                    type="button" 
                    onClick={handleGenerateQRCode} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    disabled={isSubmitting || !selectedBranch}
                  >
                    {isSubmitting ? 'Generating...' : 'Generate'}
                  </button>
              </div>
            </div>
          </div>
        }

      </div>
    </Layout>
  );
}
