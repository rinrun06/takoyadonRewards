
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Building, 
  Plus, 
  Trash2, 
  Users,
  Home,
  Search
} from "lucide-react";
import Layout from "../../Components/Layout";
import type { Franchise, CompanyOwned, Branch, PendingUser } from "../../shared/types";

export default function SystemManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"franchises" | "company_owned" | "branches" | "users">("franchises");
  const [searchTerm, setSearchTerm] = useState("");

  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [companyOwned, setCompanyOwned] = useState<CompanyOwned[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  // State for modals and forms
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state - simplified for now
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [franchisesRes, companyOwnedRes, branchesRes, usersRes] = await Promise.all([
        supabase.from('franchises').select('*'),
        supabase.from('company_owned').select('*'),
        supabase.from('branches').select('*'),
        supabase.from('admin_users').select('*'),
      ]);

      if (franchisesRes.error) throw franchisesRes.error;
      if (companyOwnedRes.error) throw companyOwnedRes.error;
      if (branchesRes.error) throw branchesRes.error;
      if (usersRes.error) throw usersRes.error;

      setFranchises(franchisesRes.data || []);
      setCompanyOwned(companyOwnedRes.data || []);
      setBranches(branchesRes.data || []);
      setPendingUsers(usersRes.data || []);

    } catch (error) {
      console.error("Failed to fetch system data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleCreate = async () => {
    try {
        let error;
        // Basic validation
        if (!newItemName) {
            alert("Name is required.");
            return;
        }
        
        const payload: { name: string; description?: string } = { name: newItemName };
        if (newItemDescription) {
            payload.description = newItemDescription;
        }

        ({ error } = await supabase.from(activeTab).insert(payload));
        
        if (error) throw error;
        
        fetchData();
        setShowCreateModal(false);
        setNewItemName("");
        setNewItemDescription("");
    } catch (error) {
        console.error(`Failed to create ${activeTab}:`, error);
        alert(`Failed to create item: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      let error;
      if (activeTab === 'users') {
        ({ error } = await supabase.from('admin_users').delete().eq('user_id', id));
      } else {
        ({ error } = await supabase.from(activeTab).delete().eq('id', id));
      }

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error(`Failed to delete item from ${activeTab}:`, error);
    }
  };

  const filteredData = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    switch (activeTab) {
        case 'franchises': return franchises.filter(item => item.name.toLowerCase().includes(lowercasedSearchTerm));
        case 'company_owned': return companyOwned.filter(item => item.name.toLowerCase().includes(lowercasedSearchTerm));
        case 'branches': return branches.filter(item => item.name.toLowerCase().includes(lowercasedSearchTerm));
        case 'users': return pendingUsers.filter(item => item.email.toLowerCase().includes(lowercasedSearchTerm));
        default: return [];
    }
  }, [searchTerm, activeTab, franchises, companyOwned, branches, pendingUsers]);
  
  const renderTabs = () => {
    const tabs = [
        { id: "franchises", label: "Franchises", icon: Home, count: franchises.length },
        { id: "company_owned", label: "Company Owned", icon: Building, count: companyOwned.length },
        { id: "branches", label: "Branches", icon: Building, count: branches.length },
        { id: "users", label: "Users", icon: Users, count: pendingUsers.length },
    ];

    return (
        <div className="border-b border-gray-200">
            <div className="sm:hidden">
                <select id="tabs" name="tabs" className="block w-full rounded-md border-gray-300 focus:border-red-500 focus:ring-red-500" onChange={(e) => setActiveTab(e.target.value as any)}>
                    {tabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
                </select>
            </div>
            <div className="hidden sm:block">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            <tab.icon className="-ml-0.5 mr-2 h-5 w-5"/>
                            {tab.label} <span className="ml-2 bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-xs">{tab.count}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
  }

  const renderContent = () => {
    if (loading) return <div className="text-center p-10">Loading...</div>;

    if (filteredData.length === 0) {
        return <div className="text-center p-10 text-gray-500">No items found.</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item: any) => (
                <div key={item.id || item.user_id} className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between transition-shadow hover:shadow-lg">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 truncate">{item.name || item.email}</h3>
                        <p className="text-sm text-gray-600">{item.description || `Role: ${item.role}`}</p>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button onClick={() => handleDelete(item.id || item.user_id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                            <Trash2 className="h-5 w-5"/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/admin/super-admin" className="flex items-center text-gray-600 hover:text-black mb-8">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">System Management</h1>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary bg-red-600 text-white flex items-center justify-center rounded-lg px-4 py-2 shadow-md hover:bg-red-700 transition-colors">
                    <Plus className="mr-2 h-5 w-5" /> Create New
                </button>
            </div>

            {renderTabs()}
            
            <div className="mt-6 mb-6">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search in ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-red-500 focus:ring-red-500 sm:text-sm p-3"
                    />
                </div>
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New {activeTab.slice(0, -1)}</h2>
                        
                        <div className="space-y-4">
                            <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Name or Email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"/>
                            {activeTab !== 'users' && <textarea value={newItemDescription} onChange={e => setNewItemDescription(e.target.value)} placeholder="Description" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" rows={3}/>}
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={handleCreate} className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </Layout>
  );
}
