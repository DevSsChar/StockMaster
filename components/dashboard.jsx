"use client"
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    kpis: {
      totalProducts: 0,
      totalStockValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      pendingReceipts: 0,
      pendingDeliveries: 0,
      internalTransfers: 0,
      pendingAdjustments: 0,
    },
    byStatus: {
      draft: 0,
      waiting: 0,
      ready: 0,
      done: 0,
      cancelled: 0,
    },
    byType: {
      receipt: 0,
      delivery: 0,
      internal: 0,
      adjustment: 0,
    },
    totalOperations: 0,
  });
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    warehouse: "",
    location: "",
    category: "",
  });
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [warehousesRes, locationsRes, productsRes] = await Promise.all([
          fetch('/api/warehouses'),
          fetch('/api/locations'),
          fetch('/api/products')
        ]);

        const warehousesData = await warehousesRes.json();
        const locationsData = await locationsRes.json();
        const productsData = await productsRes.json();

        if (warehousesData.success) setWarehouses(warehousesData.data);
        if (locationsData.success) setLocations(locationsData.data);
        
        if (productsData.success) {
          const uniqueCategories = [...new Set(
            productsData.data
              .map(p => p.category)
              .filter(Boolean)
          )];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    if (status === "authenticated") {
      fetchFilterOptions();
    }
  }, [status]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key]) queryParams.append(key, filters[key]);
        });

        const response = await fetch(`/api/dashboard/stats?${queryParams}`);
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, filters]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      warehouse: "",
      location: "",
      category: "",
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] overflow-hidden pt-16">
      {/* Header with Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Inventory operations snapshot</p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="text-sm font-medium text-gray-700">Filters:</div>
            
            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white"
            >
              <option value="">All Types</option>
              <option value="receipt">Receipts</option>
              <option value="delivery">Deliveries</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustment">Adjustments</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Warehouse Filter */}
            <select
              value={filters.warehouse}
              onChange={(e) => handleFilterChange("warehouse", e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh._id} value={wh._id}>{wh.name}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filters.type || filters.status || filters.warehouse || filters.location || filters.category) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="px-6 py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Products */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Products</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.kpis.totalProducts}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.kpis.totalStockValue} units in stock</p>
                    </div>
                    <div className="text-blue-500 text-4xl">📦</div>
                  </div>
                </div>

                {/* Low Stock Items */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Low Stock / Out of Stock</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats.kpis.lowStockItems + stats.kpis.outOfStockItems}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.kpis.lowStockItems} low, {stats.kpis.outOfStockItems} out
                      </p>
                    </div>
                    <div className="text-amber-500 text-4xl">⚠️</div>
                  </div>
                </div>

                {/* Pending Receipts */}
                <div 
                  onClick={() => router.push('/receipts')}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pending Receipts</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.kpis.pendingReceipts}</p>
                      <p className="text-xs text-gray-500 mt-1">Incoming shipments</p>
                    </div>
                    <div className="text-green-500 text-4xl">📥</div>
                  </div>
                </div>

                {/* Pending Deliveries */}
                <div 
                  onClick={() => router.push('/delivery')}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pending Deliveries</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.kpis.pendingDeliveries}</p>
                      <p className="text-xs text-gray-500 mt-1">Outgoing shipments</p>
                    </div>
                    <div className="text-red-500 text-4xl">📤</div>
                  </div>
                </div>

                {/* Internal Transfers */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Internal Transfers</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.kpis.internalTransfers}</p>
                      <p className="text-xs text-gray-500 mt-1">Scheduled moves</p>
                    </div>
                    <div className="text-purple-500 text-4xl">🔄</div>
                  </div>
                </div>

                {/* Pending Adjustments */}
                <div 
                  onClick={() => router.push('/inventory/adjustments')}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pending Adjustments</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.kpis.pendingAdjustments}</p>
                      <p className="text-xs text-gray-500 mt-1">Stock corrections</p>
                    </div>
                    <div className="text-indigo-500 text-4xl">⚖️</div>
                  </div>
                </div>
              </div>

              {/* Operations Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* By Status */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Operations by Status</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                        <span className="text-lg font-bold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Type */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Operations by Type</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-700">Receipts</span>
                      <span className="text-lg font-bold text-green-900">{stats.byType.receipt}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-700">Deliveries</span>
                      <span className="text-lg font-bold text-red-900">{stats.byType.delivery}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-700">Internal Transfers</span>
                      <span className="text-lg font-bold text-purple-900">{stats.byType.internal}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">Adjustments</span>
                      <span className="text-lg font-bold text-blue-900">{stats.byType.adjustment}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}