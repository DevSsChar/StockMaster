'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeliveryList from './DeliveryList';
import DeliveryKanban from './DeliveryKanban';

export default function DeliveryOperations() {
  const router = useRouter();
  const [view, setView] = useState('list'); // 'list' or 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch deliveries from API
  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/deliveries');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch deliveries');
      }

      // Transform API data to match UI format
      const transformedDeliveries = data.data.map((delivery) => ({
        _id: delivery._id,
        id: delivery._id,
        reference: delivery.reference,
        from: delivery.sourceLocation?.name || 'Warehouse',
        to: delivery.deliveryAddress || delivery.destLocation?.name || 'N/A',
        contact: delivery.responsible || 'N/A',
        scheduleDate: delivery.scheduledDate,
        status: delivery.status === 'ready' ? 'Ready' : 
                delivery.status === 'waiting' ? 'Waiting' :
                delivery.status === 'done' ? 'Done' :
                delivery.status === 'draft' ? 'Draft' : 'Draft',
      }));

      setDeliveries(transformedDeliveries);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => 
    delivery.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16 p-6">
        <div className="bg-red-100 border border-red-400 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16">
      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/delivery/new')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              NEW
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
        </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search reference or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

            {/* List View Button */}
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${
                view === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

            {/* Kanban View Button */}
            <button 
              onClick={() => setView('kanban')}
              className={`p-2 rounded-lg transition-all ${
                view === 'kanban' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {view === 'list' ? (
          <DeliveryList deliveries={filteredDeliveries} />
        ) : (
          <DeliveryKanban deliveries={filteredDeliveries} />
        )}
      </div>
    </div>
  );
}
