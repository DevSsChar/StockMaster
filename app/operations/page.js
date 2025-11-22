"use client"
// import AppLayout from "@/components/AppLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function OperationsPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    receipts: 0,
    deliveries: 0,
    adjustments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [receiptsRes, deliveriesRes, adjustmentsRes] = await Promise.all([
          fetch('/api/receipts'),
          fetch('/api/deliveries'),
          fetch('/api/inventory/adjustments')
        ]);

        const receiptsData = await receiptsRes.json();
        const deliveriesData = await deliveriesRes.json();
        const adjustmentsData = await adjustmentsRes.json();

        setStats({
          receipts: receiptsData.success ? receiptsData.count : 0,
          deliveries: deliveriesData.success ? deliveriesData.count : 0,
          adjustments: adjustmentsData.success ? adjustmentsData.count : 0
        });
      } catch (error) {
        console.error('Error fetching operation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const operationTypes = [
    {
      id: 'receipts',
      title: 'Receipts',
      subtitle: 'Incoming Stock',
      description: 'Manage incoming stock from suppliers and vendors',
      icon: '📦',
      color: 'green',
      count: stats.receipts,
      path: '/receipts'
    },
    {
      id: 'deliveries',
      title: 'Delivery Orders',
      subtitle: 'Outgoing Stock',
      description: 'Manage outgoing stock to customers',
      icon: '🚚',
      color: 'red',
      count: stats.deliveries,
      path: '/delivery'
    },
    {
      id: 'adjustments',
      title: 'Inventory Adjustment',
      subtitle: 'Stock Corrections',
      description: 'Adjust inventory quantities for corrections',
      icon: '⚖️',
      color: 'blue',
      count: stats.adjustments,
      path: '/inventory/adjustments'
    }
  ];

  return (
    
      <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Operations</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your warehouse operations</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operationTypes.map((operation) => (
                <div
                  key={operation.id}
                  onClick={() => router.push(operation.path)}
                  className={`bg-white rounded-lg border-2 border-${operation.color}-200 hover:border-${operation.color}-400 p-6 cursor-pointer transition-all hover:shadow-lg group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{operation.icon}</div>
                    <div className={`bg-${operation.color}-100 text-${operation.color}-700 px-3 py-1 rounded-full text-sm font-semibold`}>
                      {operation.count}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{operation.title}</h3>
                  <p className={`text-sm font-semibold text-${operation.color}-600 mb-3`}>{operation.subtitle}</p>
                  <p className="text-sm text-gray-600">{operation.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className={`text-sm font-semibold text-${operation.color}-600 group-hover:text-${operation.color}-700 flex items-center gap-2`}>
                      View Operations
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
 
  );
}