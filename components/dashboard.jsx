"use client"
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Static data
  const receiptData = {
    title: "Receipt",
    toDeliver: 4,
    late: 1,
    operations: 6,
    items: [
      { name: "Speedy Koala", color: "bg-green-600" },
      { name: "Grignard", color: "bg-amber-700" },
    ]
  };

  const deliveryData = {
    title: "Delivery",
    toDeliver: 1,
    late: 1,
    waiting: 2,
    operations: 6,
    // items: [
    //   { name: "Attractive Reindeer", color: "bg-purple-600", late: 1, operations: 6 },
    //   { name: "Squiggly Duck", color: "bg-indigo-600" },
    // ]
  };

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
          <div className="bg-white border-2 border-red-500/50 rounded-3xl p-12 flex flex-col shadow-md" style={{height: '50vh'}}>
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
                    <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
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
          <div className="bg-white border-2 border-red-500/50 rounded-3xl p-12 flex flex-col shadow-md" style={{height: '50vh'}}>
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
                    <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
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