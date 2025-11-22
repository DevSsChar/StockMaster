'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function StockTable() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    cost: 0,
    totalStock: 0,
    minStockRule: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();

      if (response.ok && data.success) {
        setProducts(data.data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      name: product.name,
      cost: product.cost,
      totalStock: product.totalStock,
      minStockRule: product.minStockRule,
    });
  };

  const handleUpdate = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEditingId(null);
        fetchProducts();
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchProducts();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.sku) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowAddModal(false);
        setNewProduct({
          name: '',
          sku: '',
          cost: 0,
          totalStock: 0,
          minStockRule: 0,
        });
        fetchProducts();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateFreeToUse = (totalStock) => {
    // Free to Use = On Hand - (reserved or allocated)
    // For now, assuming no reservations, so Free to Use = On Hand
    return totalStock;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16">
      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your product inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Per Unit Cost</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">On Hand</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Free to Use</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr 
                    key={product._id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {editingId === product._id ? (
                      <>
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="number"
                            value={editData.cost}
                            onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 w-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="number"
                            value={editData.totalStock}
                            onChange={(e) => handleInputChange('totalStock', parseInt(e.target.value) || 0)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 w-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-600">
                          {calculateFreeToUse(editData.totalStock)}
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(product._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-all text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-all text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-6 text-sm font-semibold text-gray-900">{product.name}</td>
                        <td className="py-3 px-6 text-sm text-gray-700">{product.cost} Rs</td>
                        <td className="py-3 px-6 text-sm text-gray-700">{product.totalStock}</td>
                        <td className="py-3 px-6 text-sm text-gray-700">{calculateFreeToUse(product.totalStock)}</td>
                        <td className="py-3 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-all text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-all text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xl">No products found</p>
                      <p className="text-sm">Add products to see them here</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">SKU *</label>
                <input
                  type="text"
                  required
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Cost (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Initial Stock</label>
                <input
                  type="number"
                  value={newProduct.totalStock}
                  onChange={(e) => setNewProduct({ ...newProduct, totalStock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Min Stock Rule</label>
                <input
                  type="number"
                  value={newProduct.minStockRule}
                  onChange={(e) => setNewProduct({ ...newProduct, minStockRule: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all font-semibold"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
