'use client';

import { useRouter } from 'next/navigation';

export default function DeliveryKanban({ deliveries }) {
  const router = useRouter();
  const statuses = ['Waiting', 'Ready', 'In Progress', 'Done'];

  const handleCardClick = (deliveryId) => {
    router.push(`/delivery/edit/${deliveryId}`);
  };

  const getDeliveriesByStatus = (status) => {
    return deliveries.filter(delivery => delivery.status === status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-500/20 border-green-500';
      case 'In Progress':
        return 'bg-blue-500/20 border-blue-500';
      case 'Waiting':
        return 'bg-yellow-500/20 border-yellow-500';
      case 'Done':
        return 'bg-gray-500/20 border-gray-500';
      default:
        return 'bg-gray-500/20 border-gray-500';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-500/30 text-green-400';
      case 'In Progress':
        return 'bg-blue-500/30 text-blue-400';
      case 'Waiting':
        return 'bg-yellow-500/30 text-yellow-400';
      case 'Done':
        return 'bg-gray-500/30 text-gray-400';
      default:
        return 'bg-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statuses.map((status) => {
        const statusDeliveries = getDeliveriesByStatus(status);
        
        return (
          <div key={status} className="flex flex-col">
            {/* Column Header */}
            <div className="bg-red-900/30 border border-red-700 rounded-t-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{status}</h3>
                <span className={`${getStatusBadgeColor(status)} text-xs px-2 py-1 rounded-full font-medium`}>
                  {statusDeliveries.length}
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-3 min-h-[300px]">
              {statusDeliveries.length > 0 ? (
                statusDeliveries.map((delivery) => (
                  <div
                    key={delivery._id || delivery.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition ${getStatusColor(status)}`}
                    onClick={() => handleCardClick(delivery._id || delivery.id)}
                  >
                    <h4 className="font-semibold text-white mb-2 hover:text-red-400">{delivery.reference}</h4>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">From:</span>
                        <span className="text-white">{delivery.from}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">To:</span>
                        <span className="text-white">{delivery.to}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contact:</span>
                        <span className="text-red-400">{delivery.contact}</span>
                      </div>
                      
                      <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                        <span className="text-gray-400">Scheduled:</span>
                        <span className="text-white">
                          {new Date(delivery.scheduleDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border-2 border-dashed border-red-900/30 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">No deliveries</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
