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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-red-900/50">
            <th className="text-left py-3 px-4 text-red-500 font-semibold">Reference</th>
            <th className="text-left py-3 px-4 text-red-500 font-semibold">From</th>
            <th className="text-left py-3 px-4 text-red-500 font-semibold">To</th>
            <th className="text-left py-3 px-4 text-red-500 font-semibold">Contact</th>
            <th className="text-left py-3 px-4 text-red-500 font-semibold">Schedule Date</th>
            <th className="text-left py-3 px-4 text-red-500 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <tr 
                key={delivery._id || delivery.id} 
                className="border-b border-red-900/20 hover:bg-red-900/10 transition cursor-pointer"
                onClick={() => handleRowClick(delivery._id || delivery.id)}
              >
                <td className="py-3 px-4 text-white font-semibold hover:text-red-400">{delivery.reference}</td>
                <td className="py-3 px-4 text-gray-300">{delivery.from}</td>
                <td className="py-3 px-4 text-gray-300">{delivery.to}</td>
                <td className="py-3 px-4 text-red-400">{delivery.contact}</td>
                <td className="py-3 px-4 text-gray-300">
                  {new Date(delivery.scheduleDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className={`py-3 px-4 font-semibold ${getStatusColor(delivery.status)}`}>
                  {delivery.status}
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

      {deliveries.length > 0 && (
        <div className="mt-6 text-center text-red-500/70">
          <p className="text-sm">Populate all delivery orders</p>
        </div>
      )}
    </div>
  );
}
