"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InventoryAdjustmentsPage() {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" or "kanban"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/inventory/adjustments");
      const data = await response.json();
      
      if (data.success) {
        // Transform data to match display format
        const transformedData = data.data.map(adj => ({
          reference: adj.reference,
          reason: adj.partner || "Inventory Adjustment",
          location: adj.sourceLocation?.name || "N/A",
          products: adj.lines?.map(line => ({
            name: line.product?.name || "Unknown Product",
            quantity: line.quantity || 0
          })) || [],
          status: adj.status,
          date: new Date(adj.createdAt).toLocaleDateString(),
        }));
        setAdjustments(transformedData);
      }
    } catch (error) {
      console.error("Error fetching adjustments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Expand adjustments to show one row per product
  const expandedAdjustments = adjustments.flatMap(adjustment =>
    adjustment.products.length > 0
      ? adjustment.products.map(product => ({
          ...adjustment,
          product: product.name,
          quantity: product.quantity,
        }))
      : [{ ...adjustment, product: "No products", quantity: 0 }]
  );

  const filteredAdjustments = expandedAdjustments.filter(
    adj =>
      adj.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adj.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adj.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-700",
      ready: "bg-blue-100 text-blue-700",
      done: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const groupedByStatus = {
    draft: filteredAdjustments.filter(adj => adj.status === "draft"),
    ready: filteredAdjustments.filter(adj => adj.status === "ready"),
    done: filteredAdjustments.filter(adj => adj.status === "done"),
    cancelled: filteredAdjustments.filter(adj => adj.status === "cancelled"),
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Adjustments</h1>
            <p className="text-sm text-gray-600 mt-1">Manage stock corrections and adjustments</p>
          </div>
          <button
            onClick={() => router.push("/inventory/adjustments/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            NEW
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by reference, reason, or location"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg font-medium ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-4 py-2 rounded-lg font-medium ${
                view === "kanban"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : view === "list" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No adjustments found. Click NEW to create one.
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((adj, index) => (
                    <tr
                      key={`${adj.reference}-${index}`}
                      className="hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {adj.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {adj.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {adj.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {adj.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {adj.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {adj.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            adj.status
                          )}`}
                        >
                          {adj.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(groupedByStatus).map(([status, items]) => (
              <div key={status} className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 uppercase text-sm">
                    {status}
                  </h3>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No items</p>
                  ) : (
                    items.map((adj, index) => (
                      <div
                        key={`${adj.reference}-${index}`}
                        className="bg-white rounded-lg p-4 shadow hover:shadow-md cursor-pointer"
                      >
                        <div className="font-medium text-blue-600 text-sm mb-2">
                          {adj.reference}
                        </div>
                        <div className="text-sm text-gray-900 mb-1">{adj.reason}</div>
                        <div className="text-xs text-gray-500 mb-2">{adj.location}</div>
                        <div className="text-sm text-gray-900 mb-1">
                          <strong>Product:</strong> {adj.product}
                        </div>
                        <div className="text-sm text-gray-900">
                          <strong>Qty:</strong> {adj.quantity}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{adj.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
