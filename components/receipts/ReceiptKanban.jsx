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
    <div className="grid grid-cols-3 gap-6 h-full">
      {statuses.map((status) => {
        const statusReceipts = getReceiptsByStatus(status);
        
        return (
          <div key={status} className="flex flex-col bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">{status}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                {statusReceipts.length}
              </span>
            </div>

            <div className="space-y-3 overflow-auto">
              {statusReceipts.length > 0 ? (
                statusReceipts.map((receipt) => (
                  <div
                    key={receipt._id || receipt.id}
                    className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleCardClick(receipt._id || receipt.id)}
                  >
                    <div className="font-semibold text-sm text-gray-900 mb-2">{receipt.reference}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><span className="font-semibold">From:</span> {receipt.from}</div>
                      <div><span className="font-semibold">To:</span> {receipt.to}</div>
                      <div><span className="font-semibold">Contact:</span> {receipt.contact}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="text-gray-500">
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-400 text-sm">No receipts</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
