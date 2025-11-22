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
    <div className="grid grid-cols-4 gap-6 h-full">
      {statuses.map((status) => {
        const statusDeliveries = getDeliveriesByStatus(status);
        
        return (
          <div key={status} className="flex flex-col bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">{status}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                {statusDeliveries.length}
              </span>
            </div>

            <div className="space-y-3 overflow-auto">
              {statusDeliveries.length > 0 ? (
                statusDeliveries.map((delivery) => (
                  <div
                    key={delivery._id || delivery.id}
                    className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleCardClick(delivery._id || delivery.id)}
                  >
                    <div className="font-semibold text-sm text-gray-900 mb-2">{delivery.reference}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><span className="font-semibold">From:</span> {delivery.from}</div>
                      <div><span className="font-semibold">To:</span> {delivery.to}</div>
                      <div><span className="font-semibold">Contact:</span> {delivery.contact}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="text-gray-500">
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-400 text-sm">No deliveries</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
