"use client"
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [receiptData, setReceiptData] = useState({
    title: "Receipt",
    toDeliver: 0,
    late: 0,
    waiting: 0,
    operations: 0,
  });
  const [deliveryData, setDeliveryData] = useState({
    title: "Delivery",
    toDeliver: 0,
    late: 0,
    waiting: 0,
    operations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch receipts
        const receiptRes = await fetch('/api/receipts');
        const receiptResult = await receiptRes.json();
        
        // Fetch deliveries
        const deliveryRes = await fetch('/api/deliveries');
        const deliveryResult = await deliveryRes.json();

        if (receiptResult.success && receiptResult.data) {
          const receipts = receiptResult.data;
          const now = new Date();
          
          setReceiptData({
            title: "Receipt",
            toDeliver: receipts.filter(r => r.status === 'ready' || r.status === 'draft').length,
            late: receipts.filter(r => {
              const scheduled = new Date(r.scheduledDate);
              return scheduled < now && r.status !== 'done';
            }).length,
            waiting: receipts.filter(r => r.status === 'draft').length,
            operations: receipts.length,
          });
        }

        if (deliveryResult.success && deliveryResult.data) {
          const deliveries = deliveryResult.data;
          const now = new Date();
          
          setDeliveryData({
            title: "Delivery",
            toDeliver: deliveries.filter(d => d.status === 'ready' || d.status === 'draft').length,
            late: deliveries.filter(d => {
              const scheduled = new Date(d.scheduledDate);
              return scheduled < now && d.status !== 'done';
            }).length,
            waiting: deliveries.filter(d => d.status === 'draft').length,
            operations: deliveries.length,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] overflow-hidden">
      {/* Compact Header */}
      {/* <header className="bg-[#2c2c2c] border-b border-gray-700">
        <div className="max-w-full px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            
            <div className="flex items-center space-x-4">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content - Full Page with Two Cards */}
      <main className="flex-1 w-full px-8 py-20 overflow-auto">
        <div className="max-w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Receipt Card */}
          <div 
            onClick={() => router.push('/receipts')}
            className="bg-white border-2 border-red-500/50 rounded-3xl p-12 flex flex-col shadow-md cursor-pointer hover:border-red-500 hover:shadow-lg transition-all" 
            style={{height: '50vh'}}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-red-600 mb-6">{receiptData.title}</h2>
                <div className="bg-red-100 text-red-700 px-8 py-3 rounded-2xl text-lg font-bold border-2 border-red-300 inline-block">
                  {receiptData.toDeliver} to receive
                </div>
              </div>
              
              {/* Right Side - Stats */}
              <div className="text-right text-xl space-y-3">
                <div className="text-gray-700">
                  <span className="text-red-600 font-bold text-2xl">{receiptData.late}</span> <span className="font-semibold">Late</span>
                </div>
                <div className="text-gray-700">
                  <span className="text-amber-600 font-bold text-2xl">{receiptData.waiting || 2}</span> <span className="font-semibold">waiting</span>
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-900 font-bold text-2xl">{receiptData.operations}</span> <span className="font-semibold">operations</span>
                </div>
              </div>
            </div>

            {/* Items List
            <div className="space-y-4 flex-1">
              {receiptData.items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={w-4 h-4 ${item.color} rounded-full}></div>
                    <span className="text-gray-800 font-semibold text-base">{item.name}</span>
                  </div>
                </div>
              ))}
            </div> */}

            {/* <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                ks04
              </p>
            </div> */}
          </div>

          {/* Delivery Card */}
          <div 
            onClick={() => router.push('/delivery')}
            className="bg-white border-2 border-red-500/50 rounded-3xl p-12 flex flex-col shadow-md cursor-pointer hover:border-red-500 hover:shadow-lg transition-all" 
            style={{height: '50vh'}}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-red-600 mb-6">{deliveryData.title}</h2>
                <div className="bg-red-100 text-red-700 px-8 py-3 rounded-2xl text-lg font-bold border-2 border-red-300 inline-block">
                  {deliveryData.toDeliver} to deliver
                </div>
              </div>
              
              {/* Right Side - Stats */}
              <div className="text-right text-xl space-y-3">
                <div className="text-gray-700">
                  <span className="text-red-600 font-bold text-2xl">{deliveryData.late}</span> <span className="font-semibold">Late</span>
                </div>
                <div className="text-gray-700">
                  <span className="text-amber-600 font-bold text-2xl">{deliveryData.waiting}</span> <span className="font-semibold">waiting</span>
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-900 font-bold text-2xl">{deliveryData.operations}</span> <span className="font-semibold">operations</span>
                </div>
              </div>
            </div>

            {/* Items List
            <div className="space-y-4 flex-1">
              {deliveryData.items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={w-4 h-4 ${item.color} rounded-full}></div>
                    <span className="text-gray-800 font-semibold text-base">{item.name}</span>
                  </div>
                </div>
              ))}
            </div> */}

            {/* <div className="mt-46 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Aqib A
              </p>
            </div> */}
          </div>

        </div>
      </main>
    </div>
  );
}