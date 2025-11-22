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
        id: delivery._id,
        reference: delivery.reference,
        from: delivery.sourceLocation?.name || 'WH/Stock1',
        to: delivery.destLocation?.name || 'vendor',
        contact: 'Contact', // You can add contact field to your model
        scheduleDate: delivery.scheduledDate,
        status: delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1),
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
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading deliveries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/delivery/new')}
            className="bg-red-900/30 hover:bg-red-900/50 text-white px-6 py-2 rounded border border-red-700 transition font-medium"
          >
            NEW
          </button>
          <h1 className="text-3xl font-bold text-red-500">Delivery</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by reference or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black border border-red-700 rounded px-4 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 w-80"
            />
            <svg 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* View Toggle Buttons */}
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded border ${
              view === 'list' 
                ? 'bg-red-900/50 border-red-500' 
                : 'bg-black border-red-700 hover:bg-red-900/30'
            } transition`}
            title="List View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => setView('kanban')}
            className={`p-2 rounded border ${
              view === 'kanban' 
                ? 'bg-red-900/50 border-red-500' 
                : 'bg-black border-red-700 hover:bg-red-900/30'
            } transition`}
            title="Kanban View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="border border-red-900/30 rounded-lg p-6 bg-black/50">
        {view === 'list' ? (
          <DeliveryList deliveries={filteredDeliveries} />
        ) : (
          <DeliveryKanban deliveries={filteredDeliveries} />
        )}
      </div>
    </div>
  );
}
