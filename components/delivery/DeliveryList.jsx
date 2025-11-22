'use client';

import { useRouter } from 'next/navigation';

export default function DeliveryList({ deliveries }) {
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready':
        return 'text-green-500';
      case 'In Progress':
        return 'text-blue-500';
      case 'Waiting':
        return 'text-yellow-500';
      case 'Done':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const handleRowClick = (deliveryId) => {
    router.push(`/delivery/edit/${deliveryId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Reference</th>
            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">From</th>
            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">To</th>
            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Contact</th>
            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Schedule Date</th>
            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <tr 
                key={delivery._id || delivery.id} 
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(delivery._id || delivery.id)}
              >
                <td className="py-3 px-6 text-sm font-semibold text-gray-900">{delivery.reference}</td>
                <td className="py-3 px-6 text-sm text-gray-700">{delivery.from}</td>
                <td className="py-3 px-6 text-sm text-gray-700">{delivery.to}</td>
                <td className="py-3 px-6 text-sm font-medium text-gray-700">{delivery.contact}</td>
                <td className="py-3 px-6 text-sm text-gray-600">
                  {new Date(delivery.scheduleDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="py-3 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    delivery.status === 'Done' 
                      ? 'bg-green-100 text-green-700' 
                      : delivery.status === 'Ready'
                      ? 'bg-orange-100 text-orange-700'
                      : delivery.status === 'Draft'
                      ? 'bg-gray-100 text-gray-700'
                      : delivery.status === 'Waiting'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {delivery.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-8 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xl">No deliveries found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
