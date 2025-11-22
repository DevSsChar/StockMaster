"use client"

import { useState, useEffect } from "react";
import { createWarehouse, createLocation, getWarehouses } from "@/backend/actions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("warehouse");
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Warehouse form state
  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    shortCode: "",
    address: "",
  });

  // Location form state
  const [locationForm, setLocationForm] = useState({
    name: "",
    shortCode: "",
    warehouse: "",
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", warehouseForm.name);
      formData.append("shortCode", warehouseForm.shortCode);
      formData.append("address", warehouseForm.address);

      const result = await createWarehouse(formData);

      if (result.success) {
        alert("Warehouse created successfully!");
        setWarehouseForm({ name: "", shortCode: "", address: "" });
        fetchWarehouses(); // Refresh warehouse list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating warehouse:", error);
      alert("Failed to create warehouse");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", locationForm.name);
      formData.append("shortCode", locationForm.shortCode);
      formData.append("warehouse", locationForm.warehouse);

      const result = await createLocation(formData);

      if (result.success) {
        alert("Location created successfully!");
        setLocationForm({ name: "", shortCode: "", warehouse: "" });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating location:", error);
      alert("Failed to create location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage warehouses and locations</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("warehouse")}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "warehouse"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Warehouse
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "location"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Location
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {activeTab === "warehouse" ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add Warehouse</h2>
              <form onSubmit={handleWarehouseSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.name}
                    onChange={(e) =>
                      setWarehouseForm({ ...warehouseForm, name: e.target.value })
                    }
                    placeholder="Enter warehouse name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    required
                  />
                </div>

                {/* Short Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.shortCode}
                    onChange={(e) =>
                      setWarehouseForm({ ...warehouseForm, shortCode: e.target.value })
                    }
                    placeholder="e.g., WH, NYC, LA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={warehouseForm.address}
                    onChange={(e) =>
                      setWarehouseForm({ ...warehouseForm, address: e.target.value })
                    }
                    placeholder="Enter warehouse address (optional)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Warehouse"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add Location</h2>
              <form onSubmit={handleLocationSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={locationForm.name}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, name: e.target.value })
                    }
                    placeholder="Enter location name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    required
                  />
                </div>

                {/* Short Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={locationForm.shortCode}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, shortCode: e.target.value })
                    }
                    placeholder="e.g., STOCK, RECV, SHIP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    required
                  />
                </div>

                {/* Warehouse Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={locationForm.warehouse}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, warehouse: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh._id} value={wh._id}>
                        {wh.name} ({wh.shortCode})
                      </option>
                    ))}
                  </select>
                  {warehouses.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No warehouses available. Please create a warehouse first.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading || warehouses.length === 0}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Location"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}