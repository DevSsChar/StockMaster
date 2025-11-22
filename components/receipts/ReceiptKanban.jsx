'use client';

import { useRouter } from 'next/navigation';

export default function ReceiptKanban({ receipts }) {
  const router = useRouter();
  const statuses = ['Draft', 'Ready', 'Done'];

  const handleCardClick = (receiptId) => {
    router.push(`/receipts/edit/${receiptId}`);
  };

  const getReceiptsByStatus = (status) => {
    return receipts.filter(receipt => receipt.status === status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-500/20 border-green-500';
      case 'Draft':
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
      case 'Draft':
        return 'bg-yellow-500/30 text-yellow-400';
      case 'Done':
        return 'bg-gray-500/30 text-gray-400';
      default:
        return 'bg-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statuses.map((status) => {
        const statusReceipts = getReceiptsByStatus(status);
        
        return (
          <div key={status} className="flex flex-col">
            {/* Column Header */}
            <div className="bg-red-900/30 border border-red-700 rounded-t-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{status}</h3>
                <span className={`${getStatusBadgeColor(status)} text-xs px-2 py-1 rounded-full font-medium`}>
                  {statusReceipts.length}
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-3 min-h-[300px]">
              {statusReceipts.length > 0 ? (
                statusReceipts.map((receipt) => (
                  <div
                    key={receipt._id || receipt.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition ${getStatusColor(status)}`}
                    onClick={() => handleCardClick(receipt._id || receipt.id)}
                  >
                    <h4 className="font-semibold text-white mb-2 hover:text-red-400">{receipt.reference}</h4>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">From:</span>
                        <span className="text-white">{receipt.from}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">To:</span>
                        <span className="text-white">{receipt.to}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contact:</span>
                        <span className="text-red-400">{receipt.contact}</span>
                      </div>
                      
                      <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                        <span className="text-gray-400">Scheduled:</span>
                        <span className="text-white">
                          {new Date(receipt.scheduleDate).toLocaleDateString('en-US', {
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
                  <p className="text-gray-500 text-sm">No receipts</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
