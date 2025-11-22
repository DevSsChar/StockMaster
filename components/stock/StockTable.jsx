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
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading stock...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      {/* Header */}
      <div className="mb-6 border-b border-red-900/30 pb-6">
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-red-500">Stock</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-red-900/30 hover:bg-red-900/50 text-white px-4 py-2 rounded border border-red-700 transition text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          User must be able to update the stock from here.
        </p>
      </div>

      {/* Stock Table */}
      <div className="border border-red-900/30 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-red-900/50 bg-red-900/10">
              <th className="text-left py-4 px-6 text-red-500 font-semibold">Product</th>
              <th className="text-left py-4 px-6 text-red-500 font-semibold">per unit cost</th>
              <th className="text-left py-4 px-6 text-red-500 font-semibold">On hand</th>
              <th className="text-left py-4 px-6 text-red-500 font-semibold">Free to Use</th>
              <th className="text-left py-4 px-6 text-red-500 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr 
                  key={product._id} 
                  className="border-b border-red-900/20 hover:bg-red-900/5 transition"
                >
                  {editingId === product._id ? (
                    <>
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-black border border-red-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-red-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="number"
                          value={editData.cost}
                          onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                          className="bg-black border border-red-700 rounded px-3 py-2 text-white w-32 focus:outline-none focus:border-red-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="number"
                          value={editData.totalStock}
                          onChange={(e) => handleInputChange('totalStock', parseInt(e.target.value) || 0)}
                          className="bg-black border border-red-700 rounded px-3 py-2 text-white w-24 focus:outline-none focus:border-red-500"
                        />
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {calculateFreeToUse(editData.totalStock)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(product._id)}
                            className="bg-green-900/30 hover:bg-green-900/50 text-white px-3 py-1 rounded border border-green-700 transition text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-700/30 hover:bg-gray-700/50 text-white px-3 py-1 rounded border border-gray-600 transition text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-6 text-white font-medium">{product.name}</td>
                      <td className="py-4 px-6 text-gray-300">{product.cost} Rs</td>
                      <td className="py-4 px-6 text-gray-300">{product.totalStock}</td>
                      <td className="py-4 px-6 text-gray-300">{calculateFreeToUse(product.totalStock)}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-red-900/30 hover:bg-red-900/50 text-white px-3 py-1 rounded border border-red-700 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="bg-gray-700/30 hover:bg-gray-700/50 text-white px-3 py-1 rounded border border-gray-600 transition text-sm"
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

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Logged in as: <span className="text-red-500">{session?.user?.name || 'User'}</span>
        </p>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-red-900/30 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-500 mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="block text-white mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-black border border-red-700 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">SKU *</label>
                <input
                  type="text"
                  required
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-black border border-red-700 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Cost (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-red-700 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Initial Stock</label>
                <input
                  type="number"
                  value={newProduct.totalStock}
                  onChange={(e) => setNewProduct({ ...newProduct, totalStock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black border border-red-700 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-white mb-2">Min Stock Rule</label>
                <input
                  type="number"
                  value={newProduct.minStockRule}
                  onChange={(e) => setNewProduct({ ...newProduct, minStockRule: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black border border-red-700 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-white px-6 py-2 rounded border border-red-700 transition"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700/30 hover:bg-gray-700/50 text-white px-6 py-2 rounded border border-gray-600 transition"
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
