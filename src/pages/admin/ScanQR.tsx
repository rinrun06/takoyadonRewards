import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, QrCode, Award, CheckCircle, Wifi, WifiOff } from "lucide-react";
import Layout from "@/Components/Layout";

type ScanMode = "award" | "redeem";

interface QueuedAction {
  id: number;
  type: ScanMode;
  payload: string;
  timestamp: Date;
}

export default function ScanQRPage() {
  const [mode, setMode] = useState<ScanMode>("award");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<QueuedAction[]>([]);

  // Effect to listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Effect to process the queue when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      // In a real app, you would send the queued actions to the server here.
      console.log("Syncing offline queue:", offlineQueue);
      alert(`Syncing ${offlineQueue.length} offline actions...`);
      // Clear the queue after successful sync
      setOfflineQueue([]);
    }
  }, [isOnline, offlineQueue]);

  const handleScan = (result: string) => {
    const action: QueuedAction = {
      id: Date.now(),
      type: mode,
      payload: result,
      timestamp: new Date(),
    };

    if (isOnline) {
      // If online, process immediately.
      // In a real app, this would be an API call.
      console.log(`Processing online action:`, action);
      setScanResult(`Successfully processed ${mode === 'award' ? 'points award' : 'redemption'} for QR: ${result}`);
    } else {
      // If offline, add to the queue.
      // In a real app, this would be saved to IndexedDB for persistence.
      setOfflineQueue(prevQueue => [...prevQueue, action]);
      setScanResult(`Offline. Action queued successfully. It will be synced when you're back online.`);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/admin/branch-staff" className="flex items-center text-gray-600 hover:text-black mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-black">Scan QR Code</h1>
                  <p className="text-gray-600">Scan campaign or redemption codes to process rewards.</p>
                </div>
            </div>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isOnline ? <Wifi className="w-4 h-4 mr-2"/> : <WifiOff className="w-4 h-4 mr-2"/>}
                {isOnline ? 'Online' : 'Offline Mode'}
            </div>
          </div>
          
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg mb-6">
            <button onClick={() => setMode("award")} className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${mode === 'award' ? 'bg-white text-black shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
              <Award className="w-5 h-5 mr-2"/> Award Points
            </button>
            <button onClick={() => setMode("redeem")} className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${mode === 'redeem' ? 'bg-white text-black shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
              <CheckCircle className="w-5 h-5 mr-2"/> Approve Redemption
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">
              {mode === 'award' 
                ? "Scan a campaign QR code to award points to a customer." 
                : "Scan a customer's redemption QR code to approve their reward."}
            </p>
            <div className="w-full max-w-sm mx-auto h-64 bg-gray-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
              <p>QR Scanner Placeholder</p>
              {/* This is where a camera feed would go */}
              <div className="absolute top-0 left-0 w-full h-full animate-scan-line bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>
            </div>
            <button onClick={() => handleScan('mock-qr-result-' + Math.floor(Math.random() * 1000))} className="mt-6 px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md">
                Simulate Scan
            </button>
            {scanResult && <p className={`mt-4 font-semibold ${isOnline && !scanResult.startsWith('Offline') ? 'text-green-600' : 'text-yellow-600'}`}>{scanResult}</p>}
            
            {offlineQueue.length > 0 && (
                <div className="mt-6 text-left p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800">Offline Queue ({offlineQueue.length})</h4>
                    <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                        {offlineQueue.map(action => (
                            <li key={action.id}>
                                {action.type} - {action.payload} @ {action.timestamp.toLocaleTimeString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
