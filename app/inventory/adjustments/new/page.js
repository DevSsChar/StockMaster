"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    location: "",
    reason: "",
    lines: [{ product: "", quantity: 0 }],
  });

  useEffect(() => {
    fetchLocations();
    fetchProducts();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addProductLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product: "", quantity: 0 }],
    });
  };

  const removeProductLine = (index) => {
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const updateProductLine = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location) {
      alert("Please select a location");
      return;
    }

    if (formData.lines.some(line => !line.product || line.quantity === 0)) {
      alert("Please fill in all product lines with valid quantities");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/inventory/adjustments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Adjustment created successfully!");
        router.push("/inventory/adjustments");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating adjustment:", error);
      alert("Failed to create adjustment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Inventory Adjustment</h1>
            <p className="text-sm text-gray-600 mt-1">Create a new stock adjustment</p>
          </div>
          <button
            onClick={() => router.push("/inventory/adjustments")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Physical count correction, Damaged goods, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* Product Lines */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Products <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addProductLine}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  + Add Product
                </button>
              </div>

              <div className="space-y-3">
                {formData.lines.map((line, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <select
                        value={line.product}
                        onChange={(e) => updateProductLine(index, "product", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((prod) => (
                          <option key={prod._id} value={prod._id}>
                            {prod.name} ({prod.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) =>
                          updateProductLine(index, "quantity", parseInt(e.target.value) || 0)
                        }
                        placeholder="Qty"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>
                    {formData.lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProductLine(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push("/inventory/adjustments")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Adjustment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
